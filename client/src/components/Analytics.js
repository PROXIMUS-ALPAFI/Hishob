import React from 'react';

import { Progress } from 'antd';
const Analytics = ({ allts }) => {
    const categories = [
        "Salary",
        "Food",
        "Fees",
        "Utility Bills",
        "Entertainment",
        "Groceries",
        "Toiletries",
        "Healthcare",
        "Gift",
        "Tax"
    ];

    if (!allts || allts.length === 0) {
        return <div>No transactions available</div>;
    }
    //total trs
    const num_trs = allts.length;
    const num_inc = allts.filter((transaction) => transaction.type === 'Income');
    const num_exp = allts.filter((transaction) => transaction.type === 'Expense');
    const inc_perc = (num_inc.length / num_trs) * 100;
    const exp_perc = (num_exp.length / num_trs) * 100;
    //total turnovers
    const total_turn = allts.reduce((acc, trs) => acc + trs.amount, 0)

    const inc_turn = allts.filter(
        (trs) => trs.type === "Income"
    ).reduce((acc, trs) => acc + trs.amount, 0)

    const exp_turn = allts.filter(
        (trs) => trs.type !== "Income"
    ).reduce((acc, trs) => acc + trs.amount, 0)

    const inct_perc = (inc_turn / total_turn) * 100
    const expt_perc = (exp_turn / total_turn) * 100
    return (
        <>
            <div className="row mt-4">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            Total Transactions: {num_trs}
                        </div>
                        <div className="card-body">
                            <h5 className='text-success'>Income Transactions: {num_inc.length}</h5>
                            <h5 className='text-danger'>Expense Transactions: {num_exp.length}</h5>
                            <div>
                                <Progress type='circle' strokeColor={'green'} className='mx-2' percent={inc_perc.toFixed(0)} />
                                <Progress type='circle' strokeColor={'red'} className='mx-2' percent={exp_perc.toFixed(0)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">
                            Total Turnover: {total_turn}
                        </div>
                        <div className="card-body">
                            <h5 className='text-success'>Income : {inc_turn}</h5>
                            <h5 className='text-danger'>Expense : {exp_turn}</h5>
                            <div>
                                <Progress type='circle' strokeColor={'green'} className='mx-2' percent={inct_perc.toFixed(0)} />
                                <Progress type='circle' strokeColor={'red'} className='mx-2' percent={expt_perc.toFixed(0)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='row mt-3'>
                <div className='col md-4'>
                    <h4>CategoryWise Income</h4>
                    {
                        categories.map((categoryl)=>{
                            const amount=allts.filter(trs=>trs.type==='Income' && trs.category===categoryl).reduce((acc,trs)=>acc+trs.amount,0)
                            return(
                                amount>0 && (
                                <>
                                <div className='card'>
                                    <div className='card-body'>
                                        <h5>{categoryl}</h5>
                                        <Progress percent={((amount/inc_turn)*100).toFixed(0)}/>
                                    </div>
                                </div>
                                </>
                            ))
                        })
                    }
                </div>
                <div className='col md-4'>
                    <h4>CategoryWise Expense</h4>
                    {
                        categories.map((categoryl)=>{
                            const amount=allts.filter(trs=>trs.type==='Expense' && trs.category===categoryl).reduce((acc,trs)=>acc+trs.amount,0)
                            return(
                                amount>0 && (
                                <>
                                <div className='card'>
                                    <div className='card-body'>
                                        <h5>{categoryl}</h5>
                                        <Progress percent={((amount/exp_turn)*100).toFixed(0)}/>
                                    </div>
                                </div>
                                </>
                            ))
                        })
                    }
                </div>
            </div>

        </>
    );
};

export default Analytics;
