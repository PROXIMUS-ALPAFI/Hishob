import React, { useState, useEffect, useMemo } from 'react';
import { message, Table, Select } from 'antd';
import { BarChartOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import Layout from '../components/layouts/layout';
import api from '../api';
import Loading from '../components/loading';
import './main.css';

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const History = ({ theme, toggleTheme }) => {
    const [loading, setLoading] = useState(false);
    const [messageApi, messageContextHolder] = message.useMessage();
    const [allts, setAllts] = useState([]);
    const [viewMode, setViewMode] = useState('monthly');
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const res = await api.post('/transactions/getts', {
                    frequency: 'all',
                    type: 'ALL',
                });
                setAllts(res.data.transactions || []);
            } catch (error) {
                messageApi.error(error.response?.data?.message || 'Unable to load transactions');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [messageApi]);

    const availableYears = useMemo(() => {
        const years = new Set();
        allts.forEach((t) => years.add(moment(t.date).format('YYYY')));
        return Array.from(years).sort();
    }, [allts]);

    useEffect(() => {
        if (availableYears.length > 0 && !selectedYear) {
            setSelectedYear(availableYears[availableYears.length - 1]);
        }
    }, [availableYears, selectedYear]);

    const groupedData = useMemo(() => {
        const filtered = selectedYear
            ? allts.filter((t) => moment(t.date).format('YYYY') === selectedYear)
            : allts;

        const groups = {};
        filtered.forEach((trs) => {
            const key = viewMode === 'monthly'
                ? moment(trs.date).format('MMM YYYY')
                : moment(trs.date).format('YYYY');
            if (!groups[key]) groups[key] = { label: key, income: 0, expense: 0, count: 0 };
            if (trs.type === 'Income') groups[key].income += Number(trs.amount || 0);
            else groups[key].expense += Number(trs.amount || 0);
            groups[key].count += 1;
        });

        return Object.values(groups).sort((a, b) => {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
        });
    }, [allts, viewMode, selectedYear]);

    const totals = useMemo(() => {
        const filtered = selectedYear
            ? allts.filter((t) => moment(t.date).format('YYYY') === selectedYear)
            : allts;
        const income = filtered.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount || 0), 0);
        const expense = filtered.filter((t) => t.type === 'Expense').reduce((s, t) => s + Number(t.amount || 0), 0);
        return { income, expense, net: income - expense, count: filtered.length };
    }, [allts, selectedYear]);

    const columns = [
        { title: 'Period', dataIndex: 'label', key: 'label' },
        {
            title: 'Income',
            dataIndex: 'income',
            key: 'income',
            render: (v) => <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatCurrency(v)}</span>,
        },
        {
            title: 'Expense',
            dataIndex: 'expense',
            key: 'expense',
            render: (v) => <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(v)}</span>,
        },
        {
            title: 'Net',
            key: 'net',
            render: (_, record) => {
                const net = record.income - record.expense;
                return <span style={{ color: net >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{formatCurrency(net)}</span>;
            },
        },
        { title: 'Transactions', dataIndex: 'count', key: 'count' },
    ];

    const handleExport = async () => {
        try {
            setLoading(true);
            const res = await api.post('/transactions/export');
            const data = res.data.transactions;
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hishob-export-${moment().format('YYYY-MM-DD')}.json`;
            a.click();
            URL.revokeObjectURL(url);
            messageApi.success(`Exported ${data.length} transactions`);
        } catch {
            messageApi.error('Export failed');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setLoading(true);
            const text = await file.text();
            const transactions = JSON.parse(text);
            const payload = Array.isArray(transactions) ? transactions : transactions.transactions || transactions.data;
            if (!Array.isArray(payload) || payload.length === 0) {
                messageApi.error('File must contain a non-empty array of transactions');
                return;
            }
            const res = await api.post('/transactions/import', { transactions: payload });
            const msg = res.data.errors?.length
                ? `${res.data.message} (${res.data.errors.length} errors)`
                : res.data.message;
            messageApi.success(msg);
            const refresh = await api.post('/transactions/getts', { frequency: 'all', type: 'ALL' });
            setAllts(refresh.data.transactions || []);
        } catch {
            messageApi.error('Import failed. Check file format.');
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    return (
        <Layout theme={theme} toggleTheme={toggleTheme}>
            {messageContextHolder}
            {loading && <Loading />}

            <div className="page-hero">
                <div>
                    <h1>Transaction History</h1>
                    <p>Month-wise and year-wise breakdown of your finances</p>
                </div>
                <div className="summary-chip">
                    {allts.length} total transactions
                </div>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <h6>View Mode</h6>
                    <div className="app-icon-switcher">
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewMode === 'monthly' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setViewMode('monthly')}
                        >
                            <CalendarOutlined /> Monthly
                        </button>
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewMode === 'yearly' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setViewMode('yearly')}
                        >
                            <BarChartOutlined /> Yearly
                        </button>
                    </div>
                </div>
                <div className="filter-group">
                    <h6>Select Year</h6>
                    <Select
                        value={selectedYear}
                        onChange={(v) => setSelectedYear(v)}
                        size="large"
                        style={{ width: '100%' }}
                    >
                        {availableYears.map((y) => (
                            <Select.Option key={y} value={y}>{y}</Select.Option>
                        ))}
                    </Select>
                </div>
                <div className="filter-group">
                    <h6>Net Balance</h6>
                    <div className="filter-summary">
                        <span style={{ color: totals.net >= 0 ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '1.1rem' }}>
                            {formatCurrency(totals.net)}
                        </span>
                    </div>
                </div>
                <div className="filter-group filter-group--actions">
                    <label className="btn app-btn auth-card__submit" style={{ cursor: 'pointer', textAlign: 'center' }}>
                        Import JSON
                        <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                    </label>
                    <button className="btn app-btn app-btn--ghost" onClick={handleExport}>
                        Export JSON
                    </button>
                </div>
            </div>

            <div className="history-summary-row">
                <div className="history-summary-card">
                    <span className="history-summary-card__icon" style={{ background: '#dcfce7' }}>
                        <ArrowUpOutlined style={{ color: '#16a34a' }} />
                    </span>
                    <div>
                        <small>Total Income</small>
                        <strong>{formatCurrency(totals.income)}</strong>
                    </div>
                </div>
                <div className="history-summary-card">
                    <span className="history-summary-card__icon" style={{ background: '#fee2e2' }}>
                        <ArrowDownOutlined style={{ color: '#dc2626' }} />
                    </span>
                    <div>
                        <small>Total Expense</small>
                        <strong>{formatCurrency(totals.expense)}</strong>
                    </div>
                </div>
                <div className="history-summary-card">
                    <span className="history-summary-card__icon" style={{ background: totals.net >= 0 ? '#dcfce7' : '#fee2e2' }}>
                        {totals.net >= 0 ? <ArrowUpOutlined style={{ color: '#16a34a' }} /> : <ArrowDownOutlined style={{ color: '#dc2626' }} />}
                    </span>
                    <div>
                        <small>Net {totals.net >= 0 ? 'Surplus' : 'Deficit'}</small>
                        <strong>{formatCurrency(totals.net)}</strong>
                    </div>
                </div>
                <div className="history-summary-card">
                    <span className="history-summary-card__icon" style={{ background: '#e0e7ff' }}>
                        <BarChartOutlined style={{ color: '#4f46e5' }} />
                    </span>
                    <div>
                        <small>Transactions</small>
                        <strong>{totals.count}</strong>
                    </div>
                </div>
            </div>

            <div className="content-card">
                {groupedData.length === 0 ? (
                    <div className="empty-state">No transactions found for this period.</div>
                ) : (
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart data={groupedData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12 }} />
                            <YAxis tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: theme === 'dark' ? '#1e293b' : '#fff',
                                    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
                                    color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                                    borderRadius: 8,
                                }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12 }} />
                            <Bar dataKey="income" fill="#16a34a" name="Income" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" fill="#dc2626" name="Expense" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="content-card" style={{ marginTop: 20 }}>
                <Table
                    columns={columns}
                    dataSource={groupedData}
                    rowKey="label"
                    pagination={false}
                    scroll={{ x: 600 }}
                />
            </div>
        </Layout>
    );
};

export default History;
