import random
import logging
import threading
import tornado.websocket
import tornado.web
import tornado.ioloop
import datetime
from perspective import Table, PerspectiveManager, PerspectiveTornadoHandler

products = ["cu", "au", "rb"]
price_ticks = [10, 0.02, 1]
base_prices = [35000, 380.22, 3400]
months = [
    ["2201", 0],  # 月份, 价格曲线
    ["2202", 100],
    ["2203", 200],
    ["2204", 320],
    ["2205", 460],
    ["2206", 650],
    ["2207", 750],
    ["2208", 850],
    ["2209", 960],
    ["2210", 1100],
]



def table_trade_source():
    rows = []
    trades = {}
    for i, product_id in enumerate(products):
        price_tick = price_ticks[i]
        base_price = base_prices[i]
        for [month, price_adjust] in months:
            symbol = f"SHFE.{product_id}{month}"
            trades[symbol] = {
                    "symbol": symbol,
                    "product_id": product_id,
                    "product_id_upper": product_id.upper(),
                    "instrument_id": f"{product_id}{month}",
                    "is_market": 1,
                    "price_tick": price_tick,
                    "last_price": base_price + random.randint(-10, 10) * price_adjust * price_tick,
                    "delivery_date": month,
                    "span": 1,
                    "close_profit": 0,
                    "position_profit": 0,
                    "trade_volume": 0,
            }
            
    base_dt = datetime.datetime.now()
    base_price = 35000
    for seconds in range(1, 100):
        dt = base_dt + datetime.timedelta(seconds=seconds)
        base_price = base_prices[i]
        base_price += random.randint(-50, 50)
        for i, product_id in enumerate(products):
            price_tick = price_ticks[i]
            base_price = base_prices[i]
            for [month, price_adjust] in months:
                record = trades.get(f"SHFE.{product_id}{month}")
                base_price = record["last_price"]
                record["datetime"] = dt
                record["timestamp"] = int(dt.timestamp() * 1000)
                record["offset"] = seconds
                price = base_price + random.randint(-10, 10) * price_tick
                record["last_price"] = price
                offer_spread_bid = random.randint(1, 5)
                offer_spread_ask = random.randint(1, 5)
                market_spread_bid = random.randint(1, offer_spread_bid)  # 市场报价总是在自己的报价内
                market_spread_ask = random.randint(1, offer_spread_ask)
                record["offer_bid_price1"] = price - offer_spread_bid * price_tick
                record["offer_ask_price1"] = price + offer_spread_ask * price_tick
                record["bid_price1"] = price - market_spread_bid * price_tick
                record["ask_price1"] = price + market_spread_ask * price_tick
                record["ask_volume1"] = random.randint(1, 10)
                record["bid_volume1"] = random.randint(1, 10)
                record["offer_ask_volume1"] = random.randint(1, record["ask_volume1"])
                record["offer_bid_volume1"] = random.randint(1, record["bid_volume1"])

                record["trade_volume"] += random.randint(1, 10)
                record["close_profit"] += random.randint(-1000, 1000) * price_tick
                record["net_position"] = random.randint(-10, 10)
                record["position_profit"] += random.randint(-100, 100) * random.randint(-10, 10)
                record["valid_length"] = random.randint(0, 1)
                record["valid_length_temp"] = -0.01 if random.randint(0, 5) == 0 else record["valid_length"]
                record["valid_length-0.1"] = record["valid_length"] - 0.1
                record["commission"] = random.random() * 100

                rows.append(record.copy())
    return rows


def perspective_thread(manager):
    """Perspective application thread starts its own tornado IOLoop, and
    adds the table with the name "data_source_one", which will be used
    in the front-end."""
    psp_loop = tornado.ioloop.IOLoop()
    manager.set_loop_callback(psp_loop.add_callback)

    table_trade = Table(
        {
            "symbol": str,
            "instrument_id": str,
            "product_id": str,
            "product_id_upper": str,
            "delivery_date": str,
            "price_tick": float,
            "datetime": datetime.datetime,  # 本机采样时点
            "timestamp": int,
            "offset": float,  # 本样本点距交易日开盘的累积交易时长（单位秒）
            "last_price": float,
            "bid_price1": float,
            "ask_price1": float,
            "bid_volume1": float,
            "ask_volume1": float,  # 采样时点本合约的市场行情,最新价，买一价，卖一价，买一量，卖一量
            "offer_bid_price1": float,
            "offer_ask_price1": float, 
            "offer_bid_volume1": float,
            "offer_ask_volume1": float,  # 采样时点做市挂单位置和手数，即用户自己挂单的买一价，卖一价，买一量，卖一量，第一版方案下最多往后衍生采集对应五档
            "close_profit": float,  # 自本交易日开始至采样时点为止，本合约的累积平仓盈亏（单位元）
            "position_profit": float,  # 采样点时该合约的持仓盈亏（单位元）
            "trade_volume": float,  # 自本交易日开始至采样时点为止，本合约的累积成交量（单位手）
            "net_position": float,  # 采样时点本合约的净持仓手数
            "valid_length": float,  # 当用户设置了做市报价参数后，统计的该合约本交易有效报价时长
            "valid_length_temp": float,  #
            "valid_length-0.1": float,  # 当用户设置了做市报价参数后，统计的该合约本交易有效报价时长
            "commission": float,

            "span": float,  # 本样本点距同合约前一采样点时间间隔（单位秒）
            "is_market": int,
            "market_bid_price1": float,
            "market_bid_volume1": float,
            "market_ask_price1": float,
            "market_ask_volume1": float,  # 采样时点本合约扣除自身报单后的市场行情。例如，盘口显示 3500 价位有20手买单(bid_price1=3500, bid_volume1=20)，我们知道其中有5手是我们自己挂的买单，则扣除自身报单后，市场盘口应该是 (market_bid_volume1=15)
            # "volume_passive_buy": float,  # 挂盘买成交量，当用户买单报单后被动成交的成交量
            # "volume_passive_sell": float,  # 挂盘卖成交量，当用户卖单报单后被动成交的成交量
            # "volume_active_buy": float,  # 主动买成交量，当用户买单报单后主动成交的成交量
            # "volume_active_sell": float,  # 主动卖成交量，当用户卖单报单后主动成交的成交量
            # "insert_order_count": float,  # 自本交易日开始至采样时点为止，本合约的累积报单成功次数
            # "cancel_order_count": float,  # 自本交易日开始至采样时点为止，本合约累计撤单成功次数
            # "insert_order_volume": float,  # 自本交易日开始至采样时点为止，本合约的累积报单成功手数
            # "cancel_order_volume": float,  # 自本交易日开始至采样时点为止，本合约累计撤单成功手数
        },
    )
    manager.host_table("report", table_trade)
    table_trade.update(table_trade_source())
    psp_loop.start()


def make_app():
    manager = PerspectiveManager()

    thread = threading.Thread(target=perspective_thread, args=(manager,))
    thread.daemon = True
    thread.start()

    return tornado.web.Application(
        [
            # create a websocket endpoint that the client Javascript can access
            (
                r"/websocket",
                PerspectiveTornadoHandler,
                {"manager": manager, "check_origin": True},
            ),
            (
                r"/node_modules/(.*)",
                tornado.web.StaticFileHandler,
                {"path": "../../node_modules/@finos/"},
            ),
            (
                r"/(.*)",
                tornado.web.StaticFileHandler,
                {"path": "./", "default_filename": "index.html"},
            ),
        ]
    )


if __name__ == "__main__":
    app = make_app()
    app.listen(8080)
    logging.critical("Listening on http://localhost:8080")
    loop = tornado.ioloop.IOLoop.current()
    loop.start()
