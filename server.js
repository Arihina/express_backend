const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const port = 8000;
const app = express();

app.use(express.json());
app.use(express.static('public'));


async function getDbCollection(dbAddress, dbName, collectionName) {
    try {
        const client = new MongoClient(dbAddress);
        await client.connect();
        const db = client.db(dbName);

        return db.collection(collectionName);
    } catch (error) {
        console.error('Error connecting to database: ', error);
        throw error;
    }
}

app.get('/api/transactions', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');
        const transactions = await collection.find({}).toArray();

        res.send(transactions);
    } catch (error) {
        console.error('Error getting transactions: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post('/api/transactions', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');
        const transaction = {
            ...req.body,
            date: new Date(req.body.date)
        };

        await collection.insertOne(transaction);

        res.status(201).send({});
    } catch (error) {
        console.error('Error adding transactions: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.get('/api/transactions/:id', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');

        const transaction = await collection.findOne({ '_id': new ObjectId(req.params.id) });

        if (!transaction) {
            return res.status(404).send({ message: 'Transaction not found' });
        }

        res.send(transaction);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ message: 'Invalid transaction id' });
        }

        console.error('Error getting transaction by id: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.delete('/api/transactions/:id', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');

        const result = await collection.deleteOne({ '_id': new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: 'Transaction not found' });
        }

        res.status(204).send({});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ message: 'Invalid transaction id' });
        }

        console.error('Error deleting transaction by id: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.patch('/api/transactions/:id', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');

        const newData = { ...req.body };

        if (req.body.date) {
            newData.date = new Date(req.body.date);
        }

        const result = await collection.updateOne(
            { '_id': new ObjectId(req.params.id) },
            { '$set': newData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Transaction not found' });
        }

        res.status(200).send({});
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ message: 'Invalid transaction id' });
        }

        console.error('Error updating transaction by id: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.get('/api/statistics/transactions', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');
        const transactions = await collection.find({}).toArray();

        const incomeTransactions = transactions.filter(transaction => transaction.type === 'income');
        const expenseTransactions = transactions.filter(transaction => transaction.type === 'expense');

        const result = {
            "income": incomeTransactions,
            "expense": expenseTransactions
        };

        res.send(result);
    } catch (error) {
        console.error('Error getting transactions: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.get('/api/statistics/categories', async function (req, res) {
    try {
        const collection = await getDbCollection('mongodb://127.0.0.1', 'transactions_app', 'transactions');
        const transactions = await collection.find({}).toArray();

        const incomeTransactions = transactions.filter(transaction => transaction.type === 'income');
        const expenseTransactions = transactions.filter(transaction => transaction.type === 'expense');

        const groupTransactionsByCategory = (transactions) => {
            const categoryMap = {};
            transactions.forEach(transaction => {
                const category = transaction.category;
                if (!categoryMap[category]) {
                    categoryMap[category] = [];
                }
                categoryMap[category].push(transaction);
            });

            return categoryMap;
        };

        const incomeCategories = groupTransactionsByCategory(incomeTransactions);
        const expenseCategories = groupTransactionsByCategory(expenseTransactions);

        const result = {
            "income": incomeCategories,
            "expense": expenseCategories
        };

        res.send(result);
    } catch (error) {
        console.error('Error getting transactions: ', error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


app.listen(port, function () {
    console.log('Start server');
});

