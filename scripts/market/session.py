"""Write regular-session bounds for the runner's current Nasdaq trading date."""
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import pandas_market_calendars as calendars

now = datetime.now(ZoneInfo("America/New_York"))
schedule = calendars.get_calendar("NASDAQ").schedule(now.date(), now.date())
if not schedule.empty:
    session = schedule.iloc[0]
    start = int(session.market_open.timestamp())
    end = int(session.market_close.timestamp())
    # Allow a delayed closing job to collect the final regular-session trade.
    if start <= now.timestamp() < end + 1800:
        with open(os.environ["GITHUB_OUTPUT"], "a") as output:
            print(f"start={start}\nend={end}", file=output)
