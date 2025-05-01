
interface IEvnConfig {
    [key: string]: string | number | undefined;
    openIdApiUrl: string;
    callBackUrl: string;
    nodeEnv: string;
    port: number;
    developmentUrl?: string;
    jwtSecret: string;
    databaseUrl: string;
    databasePort: number;
    databaseName: string;
    databaseUser: string;
    databasePassword: string;
    googleClientId?: string;
    googleClientSecret?: string;
    gitHubClientId?: string;
    gitHubClientSecret?: string;
    discordClientId?: string;
    discordClientSecret?: string;
    cloudflareR2BucketName: string;
    cloudflareR2AccessKey: string;
    cloudflareR2SecretKey: string;
    cloudflareR2AccessId: string;
    cloudflareR2Domain: string;
    destinationBucketName?: string;
    destinationAccountId?: string;
    destinationAccessKey?: string;
    destinationSecretKey?: string;
}

const envConfig: IEvnConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3000', 10),
    developmentUrl: process.env.DEVELOPMENT_URL || '',
    openIdApiUrl: process.env.NEXT_PUBLIC_OPENID_API_URL || '',
    callBackUrl: process.env.NEXT_PUBLIC_CALLBACK_URL || '',
    jwtSecret: process.env.JWT_SECRET || '',
    databaseUrl: process.env.DATABASE_URL || '',
    databasePort: parseInt(process.env.DATABASE_PORT || '5432', 10),
    databaseName: process.env.DATABASE_NAME || '',
    databaseUser: process.env.PG_USER || '',
    databasePassword: process.env.PG_PASSWORD || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    gitHubClientId: process.env.GITHUB_CLIENT_ID || '',
    gitHubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    discordClientId: process.env.DISCORD_CLIENT_ID || '',
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    cloudflareR2BucketName: process.env.R2_BUCKET_NAME || '',
    cloudflareR2AccessKey: process.env.R2_ACCESS_KEY || '',
    cloudflareR2SecretKey: process.env.R2_SECRET_KEY || '',
    cloudflareR2AccessId: process.env.R2_ACCOUNT_ID || '',
    cloudflareR2Domain: process.env.R2_DOMAIN || '',
    destinationBucketName: process.env.DESTINATION_BUCKET_NAME || '',
    destinationAccountId: process.env.DESTINATION_ACCOUNT_ID || '',
    destinationAccessKey: process.env.DESTINATION_ACCESS_KEY || '',
    destinationSecretKey: process.env.DESTINATION_SECRET_KEY || ''
};

console.table(envConfig);

export const checkEnvConfig = () => {
    // Define only the required fields
    const requiredFields: string[] = [
        'nodeEnv',
        'port',
        'jwtSecret',
        'openIdApiUrl',
        'databaseUrl',
        'databaseName',
        'databaseUser',
        'databasePassword'
    ];

    for (const field of requiredFields) {
        if (!envConfig[field] || envConfig[field] === '') {
            throw new Error(`Missing required environment variable: ${field.toUpperCase()}`);
        }
    }
};

try {
    checkEnvConfig();
    console.log('All required environment variables are correctly set.');
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('An unknown error occurred.');
    }
}

export default envConfig;
