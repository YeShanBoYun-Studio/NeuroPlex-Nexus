import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserIntervention = ({ history, onUpdate }) => {
    const [editableText, setText] = useState(history.current.content);
    const [selectedPrompt, setPrompt] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setText(history.current.content);
    }, [history.current.content]);

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            await axios.post('http://localhost:5000/api/update_prompt', {
                content: editableText,
                prompt: selectedPrompt,
                parent_id: history.current.step_id,
                author: 'user'
            });
            onUpdate();
        } catch (err) {
            setError(err.message);
            console.error('保存失败:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="intervention-panel">
            <h3>步骤 #{history.current.step_id} 人工修订</h3>
            {error && <div className="error-message">{error}</div>}
            <textarea 
                value={editableText}
                onChange={(e) => setText(e.target.value)}
                rows="10"
                disabled={saving}
            />
            <select 
                value={selectedPrompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={saving}
            >
                <option value="">选择提示词模板</option>
                <option value="relay">接力创作模式</option>
                <option value="debate">辩论模式</option>
                <option value="iterate">迭代优化模式</option>
            </select>
            <button 
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? '保存中...' : '保存修改'}
            </button>
        </div>
    );
};

export default UserIntervention;
