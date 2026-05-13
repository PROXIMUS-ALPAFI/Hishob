import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Progress } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, PieChartOutlined, WalletOutlined, CalendarOutlined, TagsOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const expenseCategories = ['Food', 'Entertainment', 'Travel', 'Utilities', 'Groceries', 'Products', 'Savings'];
const incomeCategories = ['Salary', 'Dividend', 'Gift'];
const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const groupOptions = [
    { value: 'month', label: 'Month', icon: <CalendarOutlined /> },
    { value: 'year', label: 'Year', icon: <CalendarOutlined /> },
    { value: 'category', label: 'Category', icon: <TagsOutlined /> },
];

const getGroupKey = (trs, groupBy) => {
    const d = moment(trs.date);
    if (groupBy === 'month') return d.format('MMM YYYY');
    if (groupBy === 'year') return d.format('YYYY');
    return trs.category || 'Other';
};

const sortGroups = (groups, groupBy) => {
    if (groupBy === 'category') return groups;
    return groups.sort((a, b) => {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
    });
};

const Analytics = ({ allts, initialChartView = 'progress', theme }) => {
    const [mode, setMode] = useState('Expense');
    const [chartView, setChartView] = useState(initialChartView);
    const [groupBy, setGroupBy] = useState('month');

    useEffect(() => {
        setChartView(initialChartView);
    }, [initialChartView]);

    if (!allts || allts.length === 0) {
        return <div className="empty-state">No transactions available for the selected filters.</div>;
    }

    const num_trs = allts.length;
    const num_inc = allts.filter((transaction) => transaction.type === 'Income');
    const num_exp = allts.filter((transaction) => transaction.type === 'Expense');
    const inc_perc = (num_inc.length / num_trs) * 100;
    const exp_perc = (num_exp.length / num_trs) * 100;

    const inc_turn = allts.filter(
        (trs) => trs.type === "Income"
    ).reduce((acc, trs) => acc + Number(trs.amount || 0), 0)

    const exp_turn = allts.filter(
        (trs) => trs.type !== "Income"
    ).reduce((acc, trs) => acc + Number(trs.amount || 0), 0)

    const total_turn = inc_turn - exp_turn;
    const total_flow = inc_turn + exp_turn;

    const inct_perc = total_flow ? (inc_turn / total_flow) * 100 : 0;
    const expt_perc = total_flow ? (exp_turn / total_flow) * 100 : 0;

    const selectedCategories = mode === 'Income' ? incomeCategories : expenseCategories;
    const selectedTransactions = allts.filter((trs) => trs.type === mode);
    const selectedTurnover = mode === 'Income' ? inc_turn : exp_turn;
    const selectedPercent = mode === 'Income' ? inct_perc : expt_perc;
    const selectedEntryCount = mode === 'Income' ? num_inc.length : num_exp.length;

    const categoryBreakdown = selectedCategories
        .map((category) => {
            const amount = selectedTransactions
                .filter((trs) => trs.category === category)
                .reduce((acc, trs) => acc + Number(trs.amount || 0), 0);

            return {
                category,
                amount,
                percent: selectedTurnover ? Number(((amount / selectedTurnover) * 100).toFixed(0)) : 0,
            };
        })
        .filter((item) => item.amount > 0);

    const groupedData = sortGroups(
        Object.values(
            allts.reduce((acc, trs) => {
                const key = getGroupKey(trs, groupBy);
                if (!acc[key]) acc[key] = { label: key, income: 0, expense: 0 };
                if (trs.type === 'Income') acc[key].income += Number(trs.amount || 0);
                else acc[key].expense += Number(trs.amount || 0);
                return acc;
            }, {})
        ),
        groupBy
    );

    return (
        <>
            <div className="analytics-grid analytics-grid--top">
                <div className="analytics-card">
                    <div className="analytics-card__header">
                        <div className="analytics-card__title">
                            <span className="analytics-card__icon analytics-card__icon--mix"><PieChartOutlined /></span>
                            <p className="analytics-card__eyebrow">Transaction mix</p>
                            <h3>Total Transactions: {num_trs}</h3>
                        </div>
                    </div>
                    <div className="analytics-card__body">
                        <div className="analytics-metrics">
                            <h5 className='text-success'>Income Transactions: {num_inc.length}</h5>
                            <h5 className='text-danger'>Expense Transactions: {num_exp.length}</h5>
                        </div>
                        <div className="analytics-progress-row">
                            <Progress type='circle' strokeColor={'#16a34a'} className='mx-2' percent={Number(inc_perc.toFixed(0))} />
                            <Progress type='circle' strokeColor={'#dc2626'} className='mx-2' percent={Number(exp_perc.toFixed(0))} />
                        </div>
                    </div>
                </div>
                <div className="analytics-card">
                    <div className="analytics-card__header">
                        <div className="analytics-card__title">
                            <span className="analytics-card__icon analytics-card__icon--turnover"><WalletOutlined /></span>
                            <p className="analytics-card__eyebrow">Money distribution</p>
                            <h3>Net Turnover: {formatCurrency(total_turn)}</h3>
                        </div>
                    </div>
                    <div className="analytics-card__body">
                        <div className="analytics-metrics">
                            <h5 className='text-success'>Income: {formatCurrency(inc_turn)}</h5>
                            <h5 className='text-danger'>Expense: {formatCurrency(exp_turn)}</h5>
                        </div>
                        <div className="analytics-progress-row">
                            <Progress type='circle' strokeColor={'#16a34a'} className='mx-2' percent={Number(inct_perc.toFixed(0))} />
                            <Progress type='circle' strokeColor={'#dc2626'} className='mx-2' percent={Number(expt_perc.toFixed(0))} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='analytics-grid analytics-grid--details'>
                <div className='analytics-card'>
                    <div className="analytics-card__header">
                        <div className="analytics-card__title">
                            <span className="analytics-card__icon analytics-card__icon--income"><ArrowUpOutlined /></span>
                            <p className="analytics-card__eyebrow">Overview</p>
                            <h3>Income Summary</h3>
                        </div>
                    </div>
                    <div className="analytics-list">
                        <div className='analytics-list__item'>
                            <div className='analytics-list__row'>
                                <h5>Total income</h5>
                                <span>{formatCurrency(inc_turn)}</span>
                            </div>
                            <Progress percent={Number(inct_perc.toFixed(0))} strokeColor="#16a34a" />
                        </div>
                        <div className='analytics-list__item'>
                            <div className='analytics-list__row'>
                                <h5>Income entries</h5>
                                <span>{num_inc.length}</span>
                            </div>
                            <Progress percent={Number(inc_perc.toFixed(0))} strokeColor="#16a34a" />
                        </div>
                    </div>
                </div>
                <div className='analytics-card'>
                    <div className="analytics-card__header">
                        <div className="analytics-card__title">
                            <span className={`analytics-card__icon analytics-card__icon--${mode.toLowerCase()}`}>
                                {mode === 'Income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            </span>
                            <p className="analytics-card__eyebrow">
                                {chartView === 'bars' ? 'Income vs Expense' : 'Category Analytics'}
                            </p>
                            <h3>
                                {chartView === 'bars'
                                    ? `Comparison by ${groupBy}`
                                    : `${mode} breakdown`}
                            </h3>
                        </div>
                        <div className="analytics-card__controls">
                            <div className="analytics-mode-toggle">
                                <button
                                    className={`analytics-mode-toggle__button ${chartView === 'progress' ? 'analytics-mode-toggle__button--active' : ''}`}
                                    onClick={() => setChartView('progress')}
                                    type="button"
                                >
                                    <PieChartOutlined /> Progress
                                </button>
                                <button
                                    className={`analytics-mode-toggle__button ${chartView === 'bars' ? 'analytics-mode-toggle__button--active' : ''}`}
                                    onClick={() => setChartView('bars')}
                                    type="button"
                                >
                                    <BarChartOutlined /> Compare
                                </button>
                            </div>
                            {chartView === 'bars' ? (
                                <div className="analytics-mode-toggle">
                                    {groupOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            className={`analytics-mode-toggle__button ${groupBy === opt.value ? 'analytics-mode-toggle__button--active' : ''}`}
                                            onClick={() => setGroupBy(opt.value)}
                                            type="button"
                                        >
                                            {opt.icon} {opt.label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="analytics-mode-toggle">
                                    <button
                                        className={`analytics-mode-toggle__button ${mode === 'Expense' ? 'analytics-mode-toggle__button--active' : ''}`}
                                        onClick={() => setMode('Expense')}
                                        type="button"
                                    >
                                        Expense
                                    </button>
                                    <button
                                        className={`analytics-mode-toggle__button ${mode === 'Income' ? 'analytics-mode-toggle__button--active' : ''}`}
                                        onClick={() => setMode('Income')}
                                        type="button"
                                    >
                                        Income
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="analytics-list">
                        {chartView === 'bars' ? (
                            groupedData.length === 0 ? (
                                <div className='analytics-list__item'>
                                    <div className='analytics-list__row'>
                                        <h5>No data for this grouping</h5>
                                    </div>
                                </div>
                            ) : (
                                <div className='analytics-list__item'>
                                    <ResponsiveContainer width="100%" height={320}>
                                        <BarChart data={groupedData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
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
                                </div>
                            )
                        ) : (
                            <>
                                <div className='analytics-list__item'>
                                    <div className='analytics-list__row'>
                                        <h5>Total {mode.toLowerCase()}</h5>
                                        <span>{formatCurrency(selectedTurnover)}</span>
                                    </div>
                                    <Progress percent={Number(selectedPercent.toFixed(0))} strokeColor={mode === 'Income' ? '#16a34a' : '#dc2626'} />
                                </div>
                                <div className='analytics-list__item'>
                                    <div className='analytics-list__row'>
                                        <h5>{mode} entries</h5>
                                        <span>{selectedEntryCount}</span>
                                    </div>
                                    <Progress percent={Number(selectedPercent.toFixed(0))} strokeColor={mode === 'Income' ? '#16a34a' : '#dc2626'} />
                                </div>
                                {categoryBreakdown.length === 0 ? (
                                    <div className='analytics-list__item'>
                                        <div className='analytics-list__row'>
                                            <h5>No {mode.toLowerCase()} category data</h5>
                                            <span>0</span>
                                        </div>
                                    </div>
                                ) : categoryBreakdown.map((item) => (
                                    <div className='analytics-list__item' key={`${mode}-${item.category}`}>
                                        <div className='analytics-list__row'>
                                            <h5>{item.category}</h5>
                                            <span>{formatCurrency(item.amount)}</span>
                                        </div>
                                        <Progress percent={item.percent} strokeColor={mode === 'Income' ? '#16a34a' : '#dc2626'} />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Analytics;
