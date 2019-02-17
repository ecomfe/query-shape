import stringify from 'fast-json-stable-stringify';
import {QuerySet, Query, FindQuery} from '../types/index';

const findQuery: FindQuery = (querySet, key) => {
    const keyString = stringify(key);
    return querySet[keyString];
};

export default findQuery;
