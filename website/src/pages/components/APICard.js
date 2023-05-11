import styles from "@/styles/Card.module.css";

const APICard = ({ data }) => {
    return (
        <div className={`${styles.card} ${styles['card-third']}`}>
            {/* Replace this with a dynamic chart */}
            <p>API A: 200 requests</p>
            <p>API B: 150 requests</p>
            <p>API C: 100 requests</p>
        </div>
    );
}

export default APICard;
