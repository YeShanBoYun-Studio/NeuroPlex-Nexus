import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserIntervention from './UserIntervention';

const App = () => {
    const [history, setHistory] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async (rootId = null) => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/get_history', {
                params: { root_id: rootId }
            });
            if (response.data.status === 'success') {
                const historyData = response.data.history;
                setHistory({
                    current: historyData[0] || {
                        step_id: 'new',
                        content: '新建协作流程',
                        author: 'system'
                    },
                    all: historyData
                });
            }
        } catch (err) {
            setError(err.message);
            console.error('获取历史记录失败:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryUpdate = async () => {
        await fetchHistory(history?.current?.step_id);
    };

    if (loading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;

    return (
        <div className="app-container">
            <h1>NeuraCollab 协作平台</h1>
            {history && (
                <>
                    <div className="history-panel">
                        <h2>协作历史</h2>
                        {history.all?.map(entry => (
                            <div key={entry.step_id} className="history-item">
                                <div className="author">{entry.author}</div>
                                <div className="content">{entry.content}</div>
                                <div className="timestamp">{new Date(entry.timestamp).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                    <UserIntervention 
                        history={history} 
                        onUpdate={handleHistoryUpdate}
                    />
                </>
            )}
        </div>
    );
};

export default App;
