import React, {useState, useEffect, useContext} from 'react'
import { TextField, Typography, Grid, Button, FormControl, Select, MenuItem, InputLabel } from '@material-ui/core'
import useStyles from './styles';
import {v4 as uuidv4} from 'uuid';
import { useSpeechContext } from '@speechly/react-client';

import { ExpenseTrackerContext } from '../../../context/context';
import { incomeCategories, expenseCategories } from '../../../constants/categories';
import formatDate from '../../../utils/formatDate';
import CustomizedSnackbar from '../../Snackbar/Snackbar';


const initialState = {
    amount: '',
    category: '',
    type: 'Income',
    date: formatDate(new Date())
}

const Form = () => {
    const classes = useStyles();
    const [formData, setFormData] = useState(initialState);
    const {addTransaction} = useContext(ExpenseTrackerContext);
    const {segment} = useSpeechContext();
    const [open, setOpen] = useState(false);

    const createTransaction = () => {
        if(Number.isNaN(Number(formData.amount)) && !formData.date.includes('-')) return;

        const transaction = {...formData, amount: Number(formData.amount), id: uuidv4()}

        setOpen(true);
        addTransaction(transaction);
        setFormData(initialState);
    }

    useEffect(() => {
        if(segment) {
            const {intent: {intent}, isFinal, entities} = segment;
            if(intent === 'add_expense') {
                setFormData({...formData, type: 'Expense'});
            } 
            else if(intent === 'add_income') {
                setFormData({...formData, type: 'Income'});
            } 
            else if(isFinal && intent === 'create_transaction') {
                return createTransaction();
            }
            else if(isFinal && intent === 'cancel_transaction') {
                return setFormData(initialState);
            }

            entities.forEach(entity => {
                const category = `${entity.value.charAt(0)}${entity.value.slice(1).toLowerCase()}`
                switch(entity.type) {
                    case 'amount':
                        setFormData({...formData, amount: entity.value});
                        break;
                    case 'category':
                        const isIncomeCategory = incomeCategories.map(({type}) => type).includes(category);
                        const isExpenseCategory = expenseCategories.map(({type}) => type).includes(category);
                        if(isIncomeCategory) {
                            setFormData({...formData, type: 'Income', category});
                        }
                        else if(isExpenseCategory) {
                            setFormData({...formData, type: 'Expense', category});
                        }

                        break;
                    case 'date':
                        setFormData({...formData, date: entity.value});
                        break;
                    default:
                        break;
                }
            });

            if(isFinal && formData.amount && formData.category && formData.type && formData.date) {
                createTransaction();
            }
        }
    },[segment]);

    const selectedCategories = formData.type === 'Income' ? incomeCategories : expenseCategories;

    return (
        <Grid container spacing={2}>
            <CustomizedSnackbar open={open} setOpen={setOpen} />
            <Grid item xs={12}>
                <Typography align="center" variant="subtitle2" gutterBottom="">
                    {segment && segment.words.map(word => word.value).join(" ")}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                        <Select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <MenuItem value="Income">Income</MenuItem>
                            <MenuItem value="Expense">Expense</MenuItem>
                        </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {   
                            selectedCategories.map(({type}) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <TextField type="number" label="Amount" fullWidth value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}/>
            </Grid>
            <Grid item xs={6}>
                <TextField type="date" label="Date" fullWidth value={formData.date} onChange={e => setFormData({...formData, date: formatDate(e.target.value)})}/>
            </Grid>
            <Button className={classes.button} variant="outlined" color="primary" fullWidth onClick={createTransaction}>Create</Button>
        </Grid> 
    )   
}

export default Form
