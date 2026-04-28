module.exports = {
  apps: [
    {
      name: "vidflow-worker",
      script: "worker/index.js",
      cwd: "C:/Users/WINDOWS-10/Desktop/ClaudeWork/vidflow-ai",
      interpreter: "node",
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://neondb_owner:npg_4kxE3LbJDfKT@ep-blue-glitter-a1rt3x1g-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=30&connection_limit=1",
        KIE_API_KEY: "beffa03440f306213b4d975c1946dcbc",
        UPLOAD_POST_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IndlbG92ZWFpOTk2QGdtYWlsLmNvbSIsImV4cCI6NDkyODU5NzIzOCwianRpIjoiMTU2OTNjYmYtODdmMy00ODM3LTk3ZjItZDMwNjcyZjk3ODNkIn0.9EBSnbpuCT8lGCCTtDiyjWWRjQrM2FLkon39ORB7UYY",
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/worker-error.log",
      out_file: "logs/worker-out.log",
      merge_logs: true,
    },
  ],
};
