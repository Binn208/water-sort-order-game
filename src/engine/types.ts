export interface Jar {
  id: string;
  capacity: number;
  layers: string[]; // layers[0] is bottom, layers[length - 1] is top
}

export interface Customer {
  id: string;
  name: string;
  avatar?: string;
}

export interface Order {
  id: string;
  customerId: string;
  color: string;
  count: number; // Number of full jars required
  fulfilledCount: number; // Number of jars delivered so far
  maxPatienceSeconds: number;
  remainingPatienceSeconds: number;
  createdAt: number; // Queue order priority (earliest first)
}

export interface Move {
  fromJarId: string;
  toJarId: string;
  count: number;
  color: string;
}

export interface PackingEvent {
  jarId: string;
  color: string;
  orderId?: string;
  customerId?: string;
  byproduct: boolean;
}

export interface MoveRecord {
  move: Move;
  packedEvents: PackingEvent[];
  removedJars: Jar[]; // Full jars that left the board
  previousOrderSnapshots: {
    orderId: string;
    fulfilledCount: number;
  }[];
}

export interface StarThresholds {
  moves: [number, number, number]; // [3 stars, 2 stars, 1 star max moves]
  timeSeconds?: [number, number, number];
}

export interface ToolLimits {
  undo: number;
  addJar: number;
  hint: number;
}

export interface LevelDefinition {
  id: number | string;
  seed?: number;
  jars: {
    id: string;
    capacity: number;
    layers: string[];
  }[];
  orders: {
    id: string;
    customerId: string;
    color: string;
    count: number;
    maxPatienceSeconds: number;
  }[];
  starThresholds: StarThresholds;
  toolLimits?: ToolLimits;
  solution?: Move[];
  metrics?: {
    minMoves: number;
    nodesExplored: number;
    branchingFactor: number;
    deadEndRatio: number;
  };
}

export interface GameState {
  levelId: number | string;
  seed?: number;
  capacity: number;
  jars: Jar[];
  orders: Order[];
  deliveredColorsCount: Record<string, number>; // color -> number of full jars delivered
  history: MoveRecord[];
  moveCount: number;
  elapsedTimeSeconds: number;
  freeRescueAvailable: boolean;
  addedRescueJarsCount: number;
  isWon: boolean;
  isStuck: boolean;
  starThresholds: StarThresholds;
  initialSupplies: Record<string, number>; // color -> total units initially provided
}
