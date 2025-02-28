import React, { useState } from 'react';
import axios from 'axios';

const UserIntervention = ({ history }) => {
    const [editableText, setText] = useState(history.current.content);
    const [selectedPrompt, setPrompt] = useState('');

    const handleSave = async () => {
        try {
            await axios.post('http://localhost:5000/api/update_prompt', {
                content: editableText,
                prompt: selectedPrompt,
                parent_id: history.current.step_id,
                author: 'user'
            });
            alert('修改已保存!');
        } catch (error) {
            console.error('保存失败:', error);
        }
    };

    return (
        <div className="intervention-panel">
            <h3>步骤 #{history.current.step_id} 人工修订</h3>
            <textarea 
                value={editableText}
                onChange={(e) => setText(e.target.value)}
                rows="10"
                cols="50"
            />
            <select 
                value={selectedPrompt}
                onChange={(e) => setPrompt(e.target.value)}
            >
                <option value="">选择提示词模板</option>
                <option value="relay">接力创作模式</option>
                <option value="debate">辩论模式</option>
                <option value="iterate">迭代优化模式</option>
            </select>
            <button onClick={handleSave}>保存修改</button>
        </div>
    );
};

export default UserIntervention;
