import styles from "@/styles/Card.module.css";

const Card = ({ title, children }) => {
    return (
        <div className={styles.card}>
            <h2>{title}</h2>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}

export default Card;
