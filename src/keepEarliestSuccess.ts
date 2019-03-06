import {StrategyOptions} from '../types/index';

const options: StrategyOptions = {
    shouldAcceptIncomingResponse() {
        return true;
    },
    shouldUseIncomingResponse(previous) {
        return !!previous.error;
    },
};

export default options;
