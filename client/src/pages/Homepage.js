import React, { useState, useEffect } from 'react';
import { message, Form, Input, Modal, Select, Table, DatePicker } from 'antd';
import Layout from '../components/layouts/layout';
import axios from 'axios';
import Loading from '../components/loading';
import './main.css';
import {UnorderedListOutlined,AreaChartOutlined} from '@ant-design/icons';
import moment from 'moment';
import Analytics from '../components/Analytics';
const { RangePicker } = DatePicker;

const Homepage = () => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [allts, setallts] = useState([]);
    const [frequency, setFrequency] = useState('7');
    const [selectDate, setselectDate] = useState([]);
    const [type,setype]=useState('ALL')
    const [viewdata,setviewdata]=useState('table')

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
    }, [frequency, selectDate,type]);

    // Form submission
    const handlesubmit = async (value) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            setLoading(true);
            await axios.post('/transactions/addts', {
                ...value,
                userid: user._id,
            });
            message.success('Transaction Loaded Successfully');
            setLoading(false);
            setShowModal(false);
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
                    <UnorderedListOutlined className={`mx-2 ${viewdata==='table'?'inactivei':'activei'}`} onClick={()=>setviewdata('table')}/>
                    <AreaChartOutlined className={`mx-2 ${viewdata==='Analytics'?'inactivei':'activei'}`} onClick={()=>setviewdata('Analytics')}/>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        Add New
                    </button>
                </div>
            </div>
            <div className="content">
                {viewdata==='table'?
                <Table
                    columns={column}
                    dataSource={allts}
                    rowClassName={rowClassName}
                />
                :
                    <Analytics allts={allts}/>
                }
                
            </div>
            <Modal
                title="Add Transaction"
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={false}
            >
                <Form layout="vertical" onFinish={handlesubmit}>
                    <Form.Item label="Amount" name="amount">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Type" name="type">
                        <Select>
                            <Select.Option value="Income">Income</Select.Option>
                            <Select.Option value="Expense">Expense</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Category" name="category">
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
                    <Form.Item label="Description" name="description">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Reference" name="reference">
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item label="Date" name="date">
                        <Input type="date" />
                    </Form.Item>
                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-primary">
                            SAVE
                        </button>
                    </div>
                </Form>
            </Modal>
           
        </Layout>
    );
};

export default Homepage;
