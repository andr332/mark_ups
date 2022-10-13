const awsmobile = {
    "aws_project_region": process.env.VUE_APP_COGNITO_REGION,
    "aws_cognito_region": process.env.VUE_APP_COGNITO_REGION,
    "aws_user_pools_id": process.env.VUE_APP_COGNITO_POOL_ID,
    "aws_user_pools_web_client_id": process.env.VUE_APP_COGNITO_CLIENT_ID,
    "oauth": {}
};

export default awsmobile;
