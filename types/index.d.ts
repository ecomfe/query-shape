export interface Response<TData, TError> {
    readonly arrivedAt: number;
    readonly data?: TData;
    readonly error?: TError;
}

export interface Query<TKey, TData, TError> {
    readonly key: TKey;
    readonly pendingMutex: number;
    readonly response: Response<TData, TError> | null;
    readonly nextResponse: Response<TData, TError> | null;
}

export interface QuerySet<TKey, TData, TError> {
    [key: string]: Query<TKey, TData, TError> | undefined;
}

export interface QueryStrategy {
    initialize<TKey, TData, TError>(): QuerySet<TKey, TData, TError>;
    fetch<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey): QuerySet<TKey, TData, TError>;
    receive<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey, data: TData): QuerySet<TKey, TData, TError>;
    error<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey, error: TError): QuerySet<TKey, TData, TError>;
    accept<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey): QuerySet<TKey, TData, TError>;
}

export type Determine = (previous: Response<any, any>, incoming: Response<any, any>) => boolean;

export interface StrategyOptions {
    shouldAcceptIncomingResponse: Determine;
    shouldUseIncomingResponse: Determine;
}

export interface FindQuery {
    <TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey): Query<TKey, TData, TError> | undefined;
}

export interface CreateStrategy {
    (options: StrategyOptions): QueryStrategy;
}

export const findQuery: FindQuery;
export const createStrategy: CreateStrategy;
export const acceptLatest: StrategyOptions;
export const keepEarliest: StrategyOptions;
export const keepEarliestSuccess: StrategyOptions;
export const waitAccept: StrategyOptions;
