import React, { useEffect, useState } from 'react';

import { Progress } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, BarChartOutlined, PieChartOutlined, WalletOutlined } from '@ant-design/icons';

const expenseCategories = ['Food', 'Entertainment', 'Travel', 'Utilities', 'Groceries', 'Products', 'Savings'];
const incomeCategories = ['Salary', 'Dividend', 'Gift'];
const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const Analytics = ({ allts, initialChartView = 'progress' }) => {
    const [mode, setMode] = useState('Expense');
    const [chartView, setChartView] = useState(initialChartView);

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
    const total_turn = allts.reduce((acc, trs) => acc + Number(trs.amount || 0), 0)

    const inc_turn = allts.filter(
        (trs) => trs.type === "Income"
    ).reduce((acc, trs) => acc + Number(trs.amount || 0), 0)

    const exp_turn = allts.filter(
        (trs) => trs.type !== "Income"
    ).reduce((acc, trs) => acc + Number(trs.amount || 0), 0)

    const inct_perc = total_turn ? (inc_turn / total_turn) * 100 : 0
    const expt_perc = total_turn ? (exp_turn / total_turn) * 100 : 0
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
                            <h3>Total Turnover: {formatCurrency(total_turn)}</h3>
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
                            <Progress percent={Number(inc_perc.toFixed(0))} />
                        </div>
                        <div className='analytics-list__item'>
                            <div className='analytics-list__row'>
                                <h5>Income entries</h5>
                                <span>{num_inc.length}</span>
                            </div>
                            <Progress percent={Number(inc_perc.toFixed(0))} />
                        </div>
                    </div>
                </div>
                <div className='analytics-card'>
                    <div className="analytics-card__header">
                        <div className="analytics-card__title">
                            <span className={`analytics-card__icon analytics-card__icon--${mode.toLowerCase()}`}>
                                {mode === 'Income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            </span>
                            <p className="analytics-card__eyebrow">Category Analytics</p>
                            <h3>{mode} breakdown</h3>
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
                                    <BarChartOutlined /> Bars
                                </button>
                            </div>
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
                        </div>
                    </div>
                    <div className="analytics-list">
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
                                {chartView === 'bars' ? (
                                    <div className="analytics-bar">
                                        <div className="analytics-bar__track">
                                            <div
                                                className={`analytics-bar__fill analytics-bar__fill--${mode.toLowerCase()}`}
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                        <span className="analytics-bar__label">{item.percent}%</span>
                                    </div>
                                ) : (
                                    <Progress percent={item.percent} strokeColor={mode === 'Income' ? '#16a34a' : '#dc2626'} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </>
    );
};

export default Analytics;
