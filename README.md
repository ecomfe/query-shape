# query-shape

Standard utilities to manage query requests and responses

## DEMO

```javascript
import {createQuery, waitAccept} from 'query-shape';

const userListQuery = createQuery(waitAccept);
const state = {
    // {}
    userList: userListQuery.initialize()
};

const fetchUserList = async params => {
    // {
    //     [stringify(params)]: {
    //         params: params,
    //         pendingMutex: 1,
    //         response: null,
    //         nextResponse: null
    //     }
    // }
    state.userList = userListQuery.fetch(state.userList, params);

    try {
        const response = await get('/users', params);
        // {
        //     [stringify(params)]: {
        //         params: params,
        //         pendingMutex: 0,
        //         response: null,
        //         nextResponse: {
        //             data: {...},
        //         }
        //     }
        // }
        state.userList = userListQuery.receive(state.userList, params, response);
    }
    catch (ex) {
        // {
        //     [stringify(params)]: {
        //         params: params,
        //         pendingMutex: 0,
        //         response: null,
        //         nextResponse: {
        //             error: {...},
        //         }
        //     }
        // }
        state.userList = userListQuery.receive(state.userList, params, ex);
    }


    // {
    //     [stringify(params)]: {
    //         params: params,
    //         pendingMutex: 0,
    //         response: {
    //             data: {...},
    //         },
    //         nextResponse: null
    //     }
    // }
    setTimeout(() => userListQuery.accept(state.userList, params), 5000);
};

userListQuery.find(state.userList, params);
userListQuery.findData(state.userList, params);
userListQuery.findError(state.userList, params);
```
