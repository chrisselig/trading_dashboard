from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bot_db_path: str = str(
        Path.home()
        / "00_data_projects"
        / "forex_trading_bot"
        / "data"
        / "forex_bot.db"
    )
    bot_config_path: str = str(
        Path.home()
        / "00_data_projects"
        / "forex_trading_bot"
        / "config"
        / "settings.yaml"
    )
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
