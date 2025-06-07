interface IEvnConfig {
    [key: string]: string | number | undefined;
    nodeEnv: string;
    apiBaseUrl: string;
    openIdApiUrl: string;
    callBackUrl: string;
}

const envConfig: IEvnConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    openIdApiUrl: process.env.NEXT_PUBLIC_OPENID_API_URL || '',
    callBackUrl: process.env.NEXT_PUBLIC_CALLBACK_URL || ''
};


export const checkEnvConfig = () => {
    // Define only the required fields
    const requiredFields: string[] = [
        'nodeEnv',
        'apiBaseUrl',
        'openIdApiUrl',
        'callBackUrl'
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
        console.error(error.message)
    } else {
        console.error('An unknown error occurred.');
    }
}

export default envConfig;