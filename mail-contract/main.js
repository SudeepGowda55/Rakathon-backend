import cors from "cors";
import express from "express";
import { config } from "dotenv";
import formData from "form-data";
import { ethers } from "ethers";
import mailGun from "mailgun.js";
import { contractAbi, contractAddress, privateKey, RPC_URL } from "./abi.js";

const app = express();

config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

const mg = new mailGun(formData);
const mailgunClient = mg.client({ username: "api", key: process.env.MAILGUN_API_KEY });

async function sendMail() {
    try {
        const response = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN_NAME, {
            from: "NeuroCreators <noreply@neurocreators.com>",
            to: ["manvithshetty1590@gmail.com"],
            subject: "Return Accepted",
            // text: `Your File ${message.filename} has been successfully converted ${message.username}! You can download it using this File URL ${message.fileurl} or by Login into your account`,
            text: `Your Return has been accepted and you will receive the payment shortly`,
            // html: "<h1>Testing some Mailgun awesomeness!</h1>"
        })
        return response.status
    } catch (error) {
        console.error(error)
    }
}

await sendMail();

app.get("/", (req, res) => {
    res.status(200).send("Hai from server");
})

app.post("/fundContract", (req, res) => {
    let data = req.body;
    console.log(data);
    res.status(200).send("Contract Funded and this is the transaction id : 123456");
})

app.post("/fundCustomer", async (req, res) => {
    let data = req.body;
    try {
        // "customerAddress": "0x77e45C", "refundAmount": "0.00001"
        const tx = await contract.transferFunds(data.customerAddress, ethers.parseEther(data.refundAmount));
        const receipt = await tx.wait();
        res.status(200).send(`Customer Funded with ${data.refundAmount} ETH and this is the transaction id : ${receipt.transactionHash}`);
    } catch (error) {
        console.log(error);
        res.status(402).send("Error in funding customer", error);
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})