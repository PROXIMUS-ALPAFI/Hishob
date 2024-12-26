import React,{useState} from 'react'
import  { message,Form, Input,  Modal, Select} from 'antd'
import Layout from '../components/layouts/layout'
import axios from 'axios'
import Loading from '../components/loading'


const Homepage = () => {
    const [showModal,setShowModal]=useState(false)
    const [loading,setLoading]=useState(false)
    const handlesubmit=async(value)=>{
        try {
            const user = JSON.parse(localStorage.getItem('user'))
            setLoading(true)
            await axios.post("/transactions/addts",
                {...value,
                     userid:user._id,
                });
            message.success('Transaction Loaded Successfully');
            setLoading(false)
            
            setShowModal(false)
        } catch (error) {
            setLoading(false)
            message.error('Something went wrong')
        }
    }
    return (
        <Layout>
            {loading && <Loading/>}
            <div className='filters'>
                <div>range filters</div>
                <div><button className='btn btn-primary' onClick={()=>setShowModal(true)}>Add New</button></div>
            </div>
            <div className='content'></div>
            <Modal title='Add Transaction' open={showModal} onCancel={()=>setShowModal(false)} footer={false}>
                <Form layout='vertical' onFinish={handlesubmit} >
                    <Form.Item label='Amount' name='amount'>
                        <Input type='text'/>
                    </Form.Item>
                    <Form.Item label='type' name='type'>
                        <Select>
                            <Select.Option value='Income'>Income</Select.Option>
                            <Select.Option value='Expense'>Expense</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label='Category' name='category'>
                        <Select>
                            <Select.Option value='Salary'></Select.Option>
                            <Select.Option value='Food'></Select.Option>
                            <Select.Option value='Fees'></Select.Option>
                            <Select.Option value='Utility Bills'></Select.Option>
                            <Select.Option value='Entertainment'></Select.Option>
                            <Select.Option value='Groceries'></Select.Option>
                            <Select.Option value='Toileteries'></Select.Option>
                            <Select.Option value='Healthcare'></Select.Option>
                            <Select.Option value='Gift'></Select.Option>
                            <Select.Option value='tax'></Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label='Description' name='description'>
                        <Input type='text'/>
                    </Form.Item>
                    <Form.Item label='Reference' name='reference'>
                        <Input type='text'/>
                    </Form.Item>
                    <Form.Item label='Date' name='date'>
                        <Input type='date'/>
                    </Form.Item>
                    <div className='d-flex justify-content-center'>
                        <button type='submit' className='btn btn-primary' >SAVE</button>
                    </div>
                    
                </Form>
            </Modal>
        </Layout>

    )
}

export default Homepage