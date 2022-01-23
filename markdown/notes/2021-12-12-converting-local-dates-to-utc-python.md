---
title: Converting Local Dates to UTC with Python
description: A quick and easy way to convert local dates to UTC
---

You'll need to install one package before we begin, unless you already have it: `pytz`. If you don't have it installed, install it with `pip3 install pytz`.

To begin, start by importing `pytz` and `datetime`.

```python
import datetime
import pytz
```

Then, create a variable for your datetime object.

```python
dt = datetime.datetime.now()
```

Next, create another variable which holds your current timezone. To get the name of your timezone, take a look at `pytz.all_timezones` or `pytz.common_timezones`.

```python
local_timezone = pytz.timezone("America/Los_Angeles")
```

Now, we apply the timezone to the existing datetime object.

```
local_dt = local_timezone.localize(dt)
```

Finally, we convert the local timezone into UTC with `astimezone`.

```python
utc_dt = local_dt.astimezone(pytz.utc)
```

You can also simplify it to a single variable:

```python
utc_dt = (
    pytz.timezone("America/Los_Angeles")
    .localize(datetime.datetime.now())
    .astimezone(pytz.utc)
)
```

I hope this helps you!