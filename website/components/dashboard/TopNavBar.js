import React from 'react';
import styles from "../../styles/TopNavBar.module.css";

const TopNavBar = ({ currentPage }) => {
    return (
        <nav className={styles.navbar}>
            {currentPage}
        </nav>
    );
};

export default TopNavBar;