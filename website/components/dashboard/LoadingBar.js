import styles from "../../styles/LoadingBar.module.css";

const LoadingBar = () => {
    return (
        <div className={styles.loadingBar}>
            <i className="fas fa-info-circle"></i> Loading Server Info...
        </div>
    );
};

export default LoadingBar;
