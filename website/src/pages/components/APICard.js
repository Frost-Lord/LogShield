import styles from "@/styles/Card.module.css";
import Card from './Card';

const APICard = ({ data }) => {
    return (
        <Card title={"System:"}>
            <br></br>
            <p>Total Memory: 0</p>
            <p>Total Free Memory: 0</p>
        </Card>
    );
}

export default APICard;
