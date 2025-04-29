CREATE TABLE IF NOT EXISTS transactions (
                                            id TEXT PRIMARY KEY,
                                            date TEXT NOT NULL,
                                            amount REAL NOT NULL,
                                            currency TEXT NOT NULL,
                                            category TEXT,
                                            description TEXT
);
