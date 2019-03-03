import stringify from 'fast-json-stable-stringify';
import {QuerySet, Query, Response, QueryStrategy, StrategyOptions} from '../types/index';

type Determine = (previous: Response<any, any>, current: Response<any, any>) => boolean;

export default ({shouldAcceptIncomingResponse, shouldUseIncomingResponse}: StrategyOptions): QueryStrategy => {
    const autoAssign = <TKey, TData, TError>(
        querySet: QuerySet<TKey, TData, TError>,
        key: TKey,
        response: Response<TData, TError>
    ): QuerySet<TKey, TData, TError> => {
        const keyString = stringify(key);
        const previousQuery = querySet[keyString];

        if (!previousQuery) {
            throw new Error(`query [${keyString}] not found`);
        }

        const accept = !previousQuery.response || shouldAcceptIncomingResponse(previousQuery.response, response);

        if (!accept) {
            return {
                ...querySet,
                [keyString]: {
                    ...previousQuery,
                    pendingMutex: previousQuery.pendingMutex - 1,
                    nextResponse: response,
                },
            };
        }

        const override = !previousQuery.response || shouldUseIncomingResponse(previousQuery.response, response);

        return {
            ...querySet,
            [keyString]: {
                ...previousQuery,
                pendingMutex: previousQuery.pendingMutex - 1,
                response: override ? response : previousQuery.response,
                nextResponse: null,
            },
        };
    };

    return {
        initialize() {
            return {};
        },

        fetch(querySet, key) {
            const keyString = stringify(key);
            const previousQuery = querySet[keyString];

            if (previousQuery) {
                return {
                    ...querySet,
                    [keyString]: {
                        ...previousQuery,
                        pendingMutex: previousQuery.pendingMutex + 1,
                    },
                };
            }

            return {
                ...querySet,
                [keyString]: {
                    key,
                    pendingMutex: 1,
                    response: null,
                    nextResponse: null,
                },
            };
        },

        receive<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey, data: TData) {
            const response: Response<TData, TError> = {data, arrivedAt: Date.now()};

            return autoAssign(querySet, key, response);
        },

        error<TKey, TData, TError>(querySet: QuerySet<TKey, TData, TError>, key: TKey, error: TError) {
            const response: Response<TData, TError> = {error, arrivedAt: Date.now()};

            return autoAssign(querySet, key, response);
        },

        accept(querySet, key) {
            const keyString = stringify(key);
            const previousQuery = querySet[keyString];

            if (!previousQuery) {
                throw new Error(`query [${keyString}] not found`);
            }
            if (!previousQuery.nextResponse) {
                throw new Error(`no acceptable response in query [${keyString}]`);
            }

            return {
                ...querySet,
                [keyString]: {
                    ...previousQuery,
                    response: previousQuery.nextResponse,
                    nextResponse: null,
                },
            };
        },
    };
};
