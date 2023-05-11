import styles from "@/styles/Card.module.css";

const RequestCard = ({ data }) => {
    return (
        <div className={`${styles.card} ${styles['card-third']}`}>
            {/* Replace this with dynamic data */}
            <p>Item A: 50 requests</p>
            <p>Item B: 40 requests</p>
            <p>Item C: 30 requests</p>
        </div>
    );
}

export default RequestCard;
