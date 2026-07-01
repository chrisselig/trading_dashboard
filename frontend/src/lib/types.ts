export interface Trade {
  id: number;
  order_id: number | null;
  instrument: string;
  side: string;
  quantity: number;
  entry_price: number;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  pnl: number | null;
  pnl_pips: number | null;
  commission: number | null;
  event_id: number | null;
  strategy: string;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
}

export interface TradeListResponse {
  trades: Trade[];
  total: number;
}

export interface Order {
  id: number;
  ib_order_id: number | null;
  instrument: string;
  side: string;
  order_type: string;
  quantity: number;
  price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  status: string;
  event_id: number | null;
  strategy: string;
  created_at: string;
  commission: number | null;
  filled_at: string | null;
  fill_price: number | null;
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
}

export interface PnlByGroup {
  group: string;
  total_pnl: number;
  trade_count: number;
}

export interface Performance {
  total_pnl: number;
  total_commission: number;
  net_pnl: number;
  trade_count: number;
  win_count: number;
  loss_count: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  max_drawdown: number;
  best_trade: number;
  worst_trade: number;
  avg_win: number;
  avg_loss: number;
  equity_curve: EquityPoint[];
  pnl_by_pair: PnlByGroup[];
  pnl_by_strategy: PnlByGroup[];
}

export interface StraddleParams {
  instrument: string;
  straddle_distance_pips: number;
  straddle_tp_pips: number;
  straddle_sl_pips: number;
}

export interface EconomicEvent {
  id: number | null;
  title: string;
  country: string;
  impact: string;
  scheduled_at: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  fred_series: string | null;
  created_at: string | null;
  source: string | null;
  pairs: StraddleParams[];
}

export interface EventListResponse {
  upcoming: EconomicEvent[];
  historical: EconomicEvent[];
}

export interface Position {
  instrument: string;
  side: string;
  quantity: number;
  entry_price: number;
  current_pnl: number | null;
}

export interface PendingOrder {
  id: number;
  instrument: string;
  side: string;
  order_type: string;
  quantity: number;
  price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  strategy: string;
  created_at: string;
}

export interface BotConfig {
  instruments: string[];
  default_timeframe: string;
  max_risk_per_trade_pct: number;
  max_daily_drawdown_pct: number;
  max_concurrent_positions: number;
  max_spread_pips: number;
  straddle_distance_pips: number;
  straddle_tp_pips: number;
  straddle_sl_pips: number;
  straddle_pair_overrides: Record<string, unknown>;
}

export interface SystemStatus {
  open_positions: Position[];
  pending_orders: PendingOrder[];
  bot_config: BotConfig | null;
  db_size_mb: number;
  last_trade_at: string | null;
  last_event_at: string | null;
}

export interface Dashboard {
  todays_pnl: number;
  open_position_count: number;
  next_event: EconomicEvent | null;
  recent_trades: Trade[];
  upcoming_events: EconomicEvent[];
  equity_curve: EquityPoint[];
}
