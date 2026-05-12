import React, { useState, useEffect } from 'react';
import { message, Form, Input, Modal, Select, Table, DatePicker } from 'antd';
import Layout from '../components/layouts/layout';
import api from '../api';
import Loading from '../components/loading';
import './main.css';
import {
    UnorderedListOutlined,
    AreaChartOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    BarChartOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import moment from 'moment';
import Analytics from '../components/Analytics';

const { RangePicker } = DatePicker;
const expenseCategories = ['Food', 'Entertainment', 'Travel', 'Utilities', 'Groceries', 'Products', 'Savings'];
const incomeCategories = ['Salary', 'Dividend', 'Gift'];
const timeViews = [
    { value: 'daily', label: 'Daily', picker: 'date' },
    { value: 'weekly', label: 'Weekly', picker: 'week' },
    { value: 'monthly', label: 'Monthly', picker: 'month' },
    { value: 'yearly', label: 'Yearly', picker: 'year' },
    { value: 'all', label: 'All time' },
    { value: 'custom', label: 'Custom' },
];
const moneyQuotes = [
    '"Do not save what is left after spending, but spend what is left after saving."',
    '"A budget is telling your money where to go instead of wondering where it went."',
    '"Beware of little expenses; a small leak will sink a great ship."',
    '"The habit of saving is itself an education."',
];

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;

const TransactionForm = ({ editable, onSubmit }) => {
    const [form] = Form.useForm();
    const selectedType = Form.useWatch('type', form) || editable?.type || 'Expense';
    const availableCategories = selectedType === 'Income' ? incomeCategories : expenseCategories;

    useEffect(() => {
        if (!editable) {
            form.setFieldsValue({ type: 'Expense', category: expenseCategories[0] });
            return;
        }

        form.setFieldsValue({
            ...editable,
            date: editable.date ? moment(editable.date).format('YYYY-MM-DD') : editable.date,
        });
    }, [editable, form]);

    useEffect(() => {
        const currentCategory = form.getFieldValue('category');
        if (!availableCategories.includes(currentCategory)) {
            form.setFieldsValue({ category: availableCategories[0] });
        }
    }, [availableCategories, form]);

    return (
        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ type: 'Expense', category: expenseCategories[0] }}>
            <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Amount is Required' }]}>
                <Input type="number" placeholder="0.00" />
            </Form.Item>
            <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Type is Required' }]}>
                <Select size="large">
                    <Select.Option value="Income">Income</Select.Option>
                    <Select.Option value="Expense">Expense</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Category is Required' }]}>
                <Select size="large">
                    {availableCategories.map((category) => (
                        <Select.Option key={category} value={category}>
                            {category}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Description is Required' }]}>
                <Input type="text" placeholder="What was this transaction for?" />
            </Form.Item>
            <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select a date' }]}>
                <Input type="date" />
            </Form.Item>
            <div className="d-flex justify-content-center">
                <button type="submit" className="auth-card__submit">
                    SAVE
                </button>
            </div>
        </Form>
    );
};

const Homepage = ({ theme, toggleTheme }) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, messageContextHolder] = message.useMessage();
    const [allts, setallts] = useState([]);
    const [frequency, setFrequency] = useState('weekly');
    const [selectedPeriod, setSelectedPeriod] = useState(dayjs());
    const [selectDate, setselectDate] = useState([]);
    const [type, setype] = useState('ALL')
    const [viewdata, setviewdata] = useState('table')
    const [editable, setEditable] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [quoteIndex, setQuoteIndex] = useState(0)

    const totalAmount = allts.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const incomeCount = allts.filter((transaction) => transaction.type === 'Income').length;
    const expenseCount = allts.filter((transaction) => transaction.type === 'Expense').length;
    const currentTimeView = timeViews.find((item) => item.value === frequency);

    const column = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (text) => <span>{moment(text).format('YYYY-MM-DD')}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            render: (amount) => <span>{formatCurrency(amount)}</span>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (value) => <span className={`type-pill ${value === 'Income' ? 'type-pill--income' : 'type-pill--expense'}`}>{value}</span>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Category',
            dataIndex: 'category',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div className="table-actions">
                    <button
                        className="table-icon-button"
                        onClick={() => {
                            setEditable(record)
                            setShowModal(true)
                        }}
                    >
                        <EditOutlined />
                    </button>
                    <button
                        className="table-icon-button table-icon-button--danger"
                        onClick={() => { hd(record) }}
                    >
                        <DeleteOutlined />
                    </button>
                </div>
            )
        },
    ];

    useEffect(() => {
        const getallts = async () => {
            try {
                setLoading(true);
                const res = await api.post('/transactions/getts', {
                    frequency,
                    selectedPeriod: selectedPeriod ? selectedPeriod.toISOString() : null,
                    selectDate,
                    type
                });
                setallts(res.data.transactions || []);
            } catch (error) {
                messageApi.error(error.response?.data?.message || 'Unable to load transactions');
            } finally {
                setLoading(false);
            }
        };
        getallts();
    }, [frequency, messageApi, refreshKey, selectDate, selectedPeriod, type]);

    useEffect(() => {
        const quoteTimer = window.setInterval(() => {
            setQuoteIndex((current) => (current + 1) % moneyQuotes.length);
        }, 5000);

        return () => window.clearInterval(quoteTimer);
    }, []);

    const hd = async (record) => {
        setLoading(true)
        try {
            const { data } = await api.post('/transactions/delts', { trs_id: record._id })
            messageApi.success(data.message || 'Transaction deleted');
            setRefreshKey((value) => value + 1);
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Unable to delete transaction');
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const handlesubmit = async (value) => {
        try {
            setLoading(true);
            if (editable) {
                await api.post('/transactions/editts', {
                    payload: {
                        ...value,
                    },
                    trs_id: editable._id
                });
                messageApi.success('Transaction updated successfully');
                setShowModal(false);
                setEditable(null);
                setRefreshKey((current) => current + 1);
            }
            else {
                const { data } = await api.post('/transactions/addts', {
                    ...value,
                });
                messageApi.success(data.message || 'Transaction added successfully');
                setShowModal(false);
                setEditable(null);
                setRefreshKey((current) => current + 1);
            }

        } catch (error) {
            messageApi.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const rowClassName = (record) => {
        return record.type === 'Income' ? 'row-income' : 'row-expense';
    };

    const renderCardsView = () => (
        <div className="transaction-cards">
            {allts.map((transaction) => (
                <article key={transaction._id} className={`transaction-card transaction-card--${transaction.type.toLowerCase()}`}>
                    <div className="transaction-card__top">
                        <div className="transaction-card__identity">
                            <span className={`transaction-card__icon transaction-card__icon--${transaction.type.toLowerCase()}`}>
                                {transaction.type === 'Income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            </span>
                            <span className={`type-pill ${transaction.type === 'Income' ? 'type-pill--income' : 'type-pill--expense'}`}>{transaction.type}</span>
                        </div>
                        <strong>{formatCurrency(transaction.amount)}</strong>
                    </div>
                    <h4>{transaction.description}</h4>
                    <p>{transaction.category}</p>
                    <div className="transaction-card__meta">
                        <span className="transaction-card__date"><CalendarOutlined /> {moment(transaction.date).format('YYYY-MM-DD')}</span>
                        <div className="table-actions">
                            <button
                                className="table-icon-button"
                                onClick={() => {
                                    setEditable(transaction);
                                    setShowModal(true);
                                }}
                            >
                                <EditOutlined />
                            </button>
                            <button className="table-icon-button table-icon-button--danger" onClick={() => hd(transaction)}>
                                <DeleteOutlined />
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );

    return (
        <Layout theme={theme} toggleTheme={toggleTheme}>
            {messageContextHolder}
            {loading && <Loading />}

            <div className="page-hero">
                <div>
                    <h1>Financial overview</h1>
                    <p>{moneyQuotes[quoteIndex]}</p>
                </div>
                <div className="summary-chip">
                    {allts.length} transactions • {formatCurrency(totalAmount)} tracked
                </div>
            </div>

            <div className="view-toolbar">
                <div className="time-view-switcher">
                    {timeViews.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`time-view-switcher__button ${frequency === option.value ? 'time-view-switcher__button--active' : ''}`}
                            onClick={() => setFrequency(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {currentTimeView?.picker && frequency !== 'custom' && frequency !== 'all' && (
                    <DatePicker
                        picker={currentTimeView.picker}
                        value={selectedPeriod}
                        onChange={(value) => setSelectedPeriod(value || dayjs())}
                        size="large"
                    />
                )}

                {frequency === 'custom' && (
                    <RangePicker value={selectDate} onChange={(values) => setselectDate(values || [])} size="large" />
                )}
            </div>

            <div className="filters">
                <div className="filter-group">
                    <h6>Current Range</h6>
                    <div className="filter-summary">
                        <span>{currentTimeView?.label || 'Weekly'}</span>
                        <span>
                            {frequency === 'custom'
                                ? (selectDate.length === 2 ? `${moment(selectDate[0]).format('MMM D')} - ${moment(selectDate[1]).format('MMM D')}` : 'Pick a date range')
                                : frequency === 'all'
                                    ? 'All recorded transactions'
                                    : selectedPeriod.format(
                                        frequency === 'yearly' ? 'YYYY' : frequency === 'monthly' ? 'MMMM YYYY' : 'MMM D, YYYY'
                                    )}
                        </span>
                    </div>
                </div>
                <div className="filter-group">
                    <h6>Select Type</h6>
                    <Select value={type} onChange={(values) => setype(values)} size="large" style={{ width: '100%' }}>
                        <Select.Option value="ALL">All</Select.Option>
                        <Select.Option value="Income">Income</Select.Option>
                        <Select.Option value="Expense">Expense</Select.Option>
                    </Select>
                </div>
                <div className="filter-group">
                    <h6>Quick Summary</h6>
                    <div className="filter-summary">
                        <span>Income entries: {incomeCount}</span>
                        <span>Expense entries: {expenseCount}</span>
                    </div>
                </div>
                <div className="filter-group filter-group--actions">
                    <div className="app-icon-switcher">
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewdata === 'table' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setviewdata('table')}
                            aria-label="Table view"
                        >
                            <UnorderedListOutlined />
                        </button>
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewdata === 'cards' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setviewdata('cards')}
                            aria-label="Card view"
                        >
                            <AppstoreOutlined />
                        </button>
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewdata === 'Analytics' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setviewdata('Analytics')}
                            aria-label="Analytics view"
                        >
                            <AreaChartOutlined />
                        </button>
                        <button
                            type="button"
                            className={`app-icon-switcher__button ${viewdata === 'bars' ? 'app-icon-switcher__button--active' : ''}`}
                            onClick={() => setviewdata('bars')}
                            aria-label="Bar graph view"
                        >
                            <BarChartOutlined />
                        </button>
                    </div>
                    <button className="btn app-btn auth-card__submit" onClick={() => setShowModal(true)}>
                        Add New
                    </button>
                </div>
            </div>

            <div className="content-card">
                {viewdata === 'table' ?
                    <Table
                        columns={column}
                        dataSource={allts}
                        rowClassName={rowClassName}
                        rowKey="_id"
                        pagination={{ pageSize: 7, showSizeChanger: false }}
                        scroll={{ x: 900 }}
                    />
                    : viewdata === 'cards'
                        ? renderCardsView()
                        : viewdata === 'bars'
                            ? <Analytics allts={allts} initialChartView="bars" />
                            : <Analytics allts={allts} initialChartView="progress" />
                }

            </div>
            {showModal && <Modal
                title={editable ? "Edit Transaction" : "Add Transaction"}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={false}
            >
                <TransactionForm editable={editable} onSubmit={handlesubmit} />
            </Modal>}

        </Layout>
    );
};

export default Homepage;
