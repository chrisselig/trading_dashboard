from pydantic import BaseModel


class EquityPoint(BaseModel):
    timestamp: str
    equity: float


class PnlByGroup(BaseModel):
    group: str
    total_pnl: float
    trade_count: int


class PerformanceResponse(BaseModel):
    total_pnl: float
    total_commission: float
    net_pnl: float
    trade_count: int
    win_count: int
    loss_count: int
    win_rate: float
    profit_factor: float
    sharpe_ratio: float
    max_drawdown: float
    best_trade: float
    worst_trade: float
    avg_win: float
    avg_loss: float
    equity_curve: list[EquityPoint]
    pnl_by_pair: list[PnlByGroup]
    pnl_by_strategy: list[PnlByGroup]
