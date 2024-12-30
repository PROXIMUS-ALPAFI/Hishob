import React, { useState, useEffect } from 'react';
import { message, Form, Input, Modal, Select, Table, DatePicker } from 'antd';
import Layout from '../components/layouts/layout';
import axios from 'axios';
import Loading from '../components/loading';
import './main.css';
import { UnorderedListOutlined, AreaChartOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import Analytics from '../components/Analytics';
const { RangePicker } = DatePicker;

const Homepage = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allts, setallts] = useState([]);
    const [frequency, setFrequency] = useState('7');
    const [selectDate, setselectDate] = useState([]);
    const [type, setype] = useState('ALL')
    const [viewdata, setviewdata] = useState('table')
    const [editable, setEditable] = useState(null)

    // Table columns
    const column = [
        {
            title: 'Date',
            dataIndex: 'date',
            render: (text) => <span>{moment(text).format('YYYY-MM-DD')}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
        },
        {
            title: 'Type',
            dataIndex: 'type',
        },
        {
            title: 'Category',
            dataIndex: 'category',
        },
        {
            title: 'Description',
            dataIndex: 'description',
        },
        {
            title: 'Reference',
            dataIndex: 'reference',
        },
        {
            title: 'Action',
            render: (text, record) => (
                <div>
                    <EditOutlined className='mx-2'
                        onClick={() => {
                            setEditable(record)
                            setShowModal(true)
                        }}
                    />
                    <DeleteOutlined className='mx-2'
                        onClick={() => { hd(record) }}
                    />
                </div>
            )
        },
    ];

    // Fetch transactions
    useEffect(() => {
        const getallts = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setLoading(true);
                const res = await axios.post('/transactions/getts', {
                    userid: user._id,
                    frequency,
                    selectDate,
                    type
                });
                setLoading(false);
                setallts(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        getallts();
    }, [frequency, selectDate, type]);

    // Form submission
    const hd = async (record) => {
        setLoading(true)
        try {
            await axios.post('/transactions/delts', { trs_id: record._id })
            setLoading(false)
            window.location.reload();
        } catch (error) {
            setLoading(false)
            console.log(error);
        }
    }

    const handlesubmit = async (value) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            setLoading(true);
            if (editable) {
                await axios.post('/transactions/editts', {
                    payload: {
                        ...value,
                        userid: user._id,
                    },
                    trs_id: editable._id
                });
                message.success('Transaction updated Successfully');
                setLoading(false);
                setShowModal(false);
                setEditable(null);
                window.location.reload();
            }
            else {
                await axios.post('/transactions/addts', {
                    ...value,
                    userid: user._id,
                });
                message.success('Transaction Loaded Successfully');
                setLoading(false);
                setShowModal(false);
                setEditable(null);
                window.location.reload();
            }

        } catch (error) {
            setLoading(false);
            message.error('Something went wrong');
        }
    };

    // Row class name logic
    const rowClassName = (record) => {
        return record.type === 'Income' ? 'row-income' : 'row-expense';
    };

    return (
        <Layout>
            {loading && <Loading />}

            <div className="filters">
                <div>
                    <h6>Select Frequency</h6>
                    <Select value={frequency} onChange={(values) => setFrequency(values)}>
                        <Select.Option value="7">This Week</Select.Option>
                        <Select.Option value="30">This Month</Select.Option>
                        <Select.Option value="365">This Year</Select.Option>
                        <Select.Option value="custom">Custom</Select.Option>
                    </Select>
                    {frequency === 'custom' && (
                        <RangePicker value={selectDate} onChange={(values) => setselectDate(values)} />
                    )}
                </div>
                <div>
                    <h6>Select Type</h6>
                    <Select value={type} onChange={(values) => setype(values)}>
                        <Select.Option value="ALL">All</Select.Option>
                        <Select.Option value="Income">Income</Select.Option>
                        <Select.Option value="Expense">Expense</Select.Option>
                    </Select>
                </div>
                <div className='mx-2'>
                    <UnorderedListOutlined className={`mx-2 ${viewdata === 'table' ? 'inactivei' : 'activei'}`} onClick={() => setviewdata('table')} />
                    <AreaChartOutlined className={`mx-2 ${viewdata === 'Analytics' ? 'inactivei' : 'activei'}`} onClick={() => setviewdata('Analytics')} />
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Add New
                    </button>
                </div>
            </div>
            <div className="content">
                {viewdata === 'table' ?
                    <Table
                        columns={column}
                        dataSource={allts}
                        rowClassName={rowClassName}
                    />
                    :
                    <Analytics allts={allts} />
                }

            </div>
            {setShowModal && <Modal
                title={editable ? "Edit Transaction" : "Add Transaction"}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={false}
            >
                <Form layout="vertical" onFinish={handlesubmit} initialValues={editable}>
                    <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Amount is Required' }]}>
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Type" name="type" rules={[{ required: true, message: 'Type is Required' }]}>
                        <Select>
                            <Select.Option value="Income">Income</Select.Option>
                            <Select.Option value="Expense">Expense</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Category is Required' }]}>
                        <Select>
                            <Select.Option value="Salary">Salary</Select.Option>
                            <Select.Option value="Food">Food</Select.Option>
                            <Select.Option value="Fees">Fees</Select.Option>
                            <Select.Option value="Utility Bills">Utility Bills</Select.Option>
                            <Select.Option value="Entertainment">Entertainment</Select.Option>
                            <Select.Option value="Groceries">Groceries</Select.Option>
                            <Select.Option value="Toiletries">Toiletries</Select.Option>
                            <Select.Option value="Healthcare">Healthcare</Select.Option>
                            <Select.Option value="Gift">Gift</Select.Option>
                            <Select.Option value="Tax">Tax</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Description is Required' }]}>
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Reference" name="reference">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select a date' }]}>
                        <Input type="date" />
                    </Form.Item>
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary">
                            SAVE
                        </button>
                    </div>
                </Form>
            </Modal>}

        </Layout>
    );
};

export default Homepage;
