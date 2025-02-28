import React from 'react';
import UserIntervention from './UserIntervention';

const App = () => {
    // 示例历史数据，实际应用中应从后端获取
    const history = {
        current: {
            step_id: 1,
            content: '初始文本内容',
        }
    };

    return (
        <div>
            <h1>NeuraCollab 协作平台</h1>
            <UserIntervention history={history} />
        </div>
    );
};

export default App;
