SQLite so we don't need to pay extra hosting costs.
It runs as a file and piggybacks off NextJS

**Hosting Plan** (prices per month)

AWS Amplify for Next hosting ~ $7 or Free
EC2 and EBS (Elastic Block Store) for DB hosting ~$8
S3 for storage and backup ~$0.03
AWS Lamdba and Eventbridge for scheduled scraping (microservice experience...) ~ $0.0?
Cloudfront + Route 53 for DNS and global Cloudfront thing ~ $3

Total cost per month = ~$15


**1. Compute: Hosting the Next.js App**

The best option: **AWS Amplify**

• **Why?**

• Fully managed hosting for your Next.js app, including SSR support.

• Simple CI/CD integration for deploying from your GitHub repository.

• Handles server-side rendering (SSR) without needing extra configuration.

• Free tier available (5 GB/month bandwidth, 1,000 build minutes).

• **How to Use?**

• Deploy your Next.js app to Amplify by connecting it to your GitHub repo.

• Configure environment variables for any API keys or database connections.

  

**2. Database: Hosting SQLite**

  

The best option: **AWS EC2 with EBS (Elastic Block Store)**

• **Why?**

• SQLite requires a persistent file-based database, and EBS provides reliable storage.

• EC2 is a flexible, scalable way to host your SQLite database alongside your scraping scripts.

• EBS ensures durability and allows you to back up the SQLite database file with snapshots.

• More cost-effective than shared network solutions like EFS.

• **How to Use?**

• Deploy your SQLite database on an EC2 instance (a small instance like t3.micro should suffice for low traffic).

• Store the SQLite file on an attached EBS volume.

• Regularly back up the SQLite file to an S3 bucket using a cron job or AWS Backup.

  

**3. Static Storage and Backups**

  

The best option: **AWS S3**

• **Why?**

• Cost-effective and highly durable storage for your SQLite backups.

• Store scraped JSON data and static assets (if needed).

• Allows you to implement versioning and lifecycle rules for archiving old backups.

• **How to Use?**

• Periodically copy your SQLite database file from EBS to an S3 bucket as a backup.

• Use lifecycle policies to archive older backups to Glacier for cost savings.

  

**4. Data Scraping Automation**

  

The best option: **AWS Lambda + EventBridge**

• **Why?**

• Serverless functions are ideal for periodic scraping tasks.

• Cost-efficient (pay-per-execution) and scales with your needs.

• EventBridge makes it easy to schedule scraping jobs (e.g., daily or weekly).

• **How to Use?**

• Write scraping scripts as Lambda functions.

• Schedule scraping tasks using EventBridge rules (e.g., every 24 hours).

• Save scraped data to your SQLite database hosted on EC2 or to S3 for processing.

  

**5. Content Delivery and DNS**

  

The best option: **AWS CloudFront + Route 53**

• **Why?**

• CloudFront serves static assets (if any) and pre-rendered pages globally, improving performance for Australian users.

• Route 53 provides reliable and fast DNS resolution for your custom domain.

• **How to Use?**

• Configure CloudFront to cache static pages or SSR content served by Amplify.

• Use Route 53 to manage your app’s domain and DNS records.

  

**6. Monitoring and Alerts**

  

The best option: **AWS CloudWatch**

• **Why?**

• Monitor scraping tasks (Lambda) and EC2 instance health.

• Set up alarms for critical events, like failed scrapes or high EC2 usage.

• **How to Use?**

• Enable logging for Lambda functions and monitor CloudWatch metrics.

• Set up alarms to notify you of scraping failures or system errors.

  

**Recommended Architecture**

  

1. **Frontend (Next.js App)**:

• Host on **AWS Amplify** for SSR and API routes.

• Integrate with **CloudFront** for global content delivery.

• Use **Route 53** for DNS and custom domain.

2. **Backend (Scraping and Database)**:

• Scraping scripts run on **AWS Lambda**, scheduled with **EventBridge**.

• SQLite database hosted on **AWS EC2** with **EBS** for persistent storage.

• Backup SQLite to **AWS S3** periodically.

3. **Monitoring**:

• Use **CloudWatch** for logs and alarms.

  

**Estimated Costs**

  

• **AWS Amplify**: Free tier likely sufficient; paid plans start at ~$7/month.

• **EC2 with EBS**: ~$5–10/month for a t3.micro instance and small EBS volume.

• **AWS S3**: ~$0.023/GB/month for SQLite backups and scraped JSON data.

• **AWS Lambda**: Minimal costs for periodic scraping (e.g., a few cents/month).

• **CloudFront and Route 53**: ~$2–3/month for DNS management and minimal CDN usage.

  

**Why This Setup?**

  

• Keeps costs low while meeting your requirements for periodic scraping, SQLite persistence, and scalable front-end hosting.

• Amplify simplifies hosting for the Next.js app, while Lambda and EC2 provide efficient scraping and database management.

• S3 ensures reliable backups without adding complexity.

  

This setup strikes the right balance between cost, simplicity, and scalability for your **OzSkate** app.