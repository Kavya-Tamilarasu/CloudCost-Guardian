# ☁️ CloudCost Guardian
### Cloud Resource Waste & Cost Leakage Detector

CloudCost Guardian is a cloud cost monitoring project designed to identify potentially wasted resources and help users understand opportunities to reduce unnecessary cloud expenditure. It focuses on detecting idle and underutilized resources through rule-based checks and presenting actionable cost optimization recommendations.

## 📌 Overview

Cloud platforms use a pay-as-you-go pricing model, where users pay for the resources they consume. However, running instances with low utilization, unattached storage volumes, and unnecessary resource allocation can lead to avoidable expenses.

CloudCost Guardian aims to simplify this process by identifying potential resource waste, organizing findings, and helping users make informed cloud resource management decisions.

## 🎯 Objectives

- Identify potentially idle or underutilized cloud resources.
- Detect unattached storage volumes that may incur costs.
- Apply rule-based checks to assess resource utilization.
- Present potential cost optimization recommendations.
- Improve visibility into cloud resource usage and cost leakage.

## ✨ Key Features

- **Resource Waste Detection:** Identify resources that may be consuming resources without sufficient utilization.
- **EC2 Instance Analysis:** Evaluate instance state and utilization indicators using configured rules.
- **EBS Volume Analysis:** Flag available, unattached EBS volumes for review.
- **Rule-Based Detection:** Use predefined thresholds and conditions rather than machine learning.
- **Cost Optimization Recommendations:** Provide suggestions for reviewing and reducing unnecessary resource usage.
- **Dashboard:** Present resource analysis and findings through the application's user interface.

*Feature availability depends on the modules implemented and configured in the current version.*

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite |
| Backend | Node.js, Express |
| Language | TypeScript / JavaScript |
| Cloud platform | Amazon Web Services (AWS) |
| Compute resources | Amazon EC2 |
| Storage resources | Amazon EBS, Amazon S3 |
| Monitoring metrics | Amazon CloudWatch |

## 🏗️ System Workflow

1. **Resource Collection:** Obtain the available cloud resource information through the configured data source.
2. **Rule Evaluation:** Evaluate resource states and utilization indicators against predefined conditions.
3. **Waste Detection:** Flag resources that may be idle, underutilized, or unattached.
4. **Recommendation Generation:** Associate detected issues with appropriate review or optimization suggestions.
5. **Dashboard Presentation:** Display the findings to support resource management decisions.

## 🔍 Example Detection Rules

### EC2 Instances

- Check whether an instance is running.
- Evaluate CPU utilization over a defined monitoring period.
- Consider network activity when assessing possible idleness.
- Flag instances that meet configured low-utilization conditions for further review.

### EBS Volumes

- Identify volumes in the `available` state.
- Flag unattached volumes for review because they may continue to incur storage charges.

These rules identify **potential waste**, not guaranteed waste. Resource purpose, workload patterns, and operational requirements should be reviewed before taking action.

## 📂 Project Structure

```text
CloudCost-Guardian/
├── public/             # Public assets
├── server/             # Backend modules
├── src/                # Frontend application
├── server.ts           # Server entry point
├── index.html          # Application HTML entry
├── package.json        # Project scripts and dependencies
├── package-lock.json   # npm dependency lockfile
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── .env.example        # Example environment variables
├── .gitignore          # Git exclusion rules
└── README.md           # Project documentation
```

*The structure may vary depending on the current implementation.*

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- Git
- An AWS account and appropriate permissions if AWS integration is enabled

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/CloudCost-Guardian.git
cd CloudCost-Guardian
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root using `.env.example` as a reference.

Add only the variables required by your implementation. If AWS integration is enabled, configure credentials securely using an appropriate AWS credentials profile or IAM role rather than committing access keys to GitHub.

### 4. Start the application

Run the development command defined in `package.json`. For example, if the project uses the `dev` script:

```bash
npm run dev
```

Open the local URL printed in the terminal.

**Note:** The exact startup command and required environment variables depend on the scripts and integrations configured in your project.

## 🔐 Security Considerations

- Never commit `.env` files, access keys, passwords, or other secrets.
- Use least-privilege IAM permissions for AWS access.
- Prefer IAM roles or temporary credentials where appropriate.
- Review recommendations before modifying or deleting cloud resources.
- Do not automatically terminate instances or delete volumes without explicit safeguards and authorization.

## 🚀 Future Enhancements

- Detailed resource utilization history.
- Cost estimates and potential savings calculations.
- Filtering and categorization of detected resources.
- Configurable thresholds and monitoring periods.
- Scheduled analysis and notifications.
- Exportable cost and resource reports.

These are potential enhancements and should not be considered implemented unless available in the application.

## 🎓 Project Information

**Project Name:** CloudCost Guardian  
**Project Type:** Cloud Computing / Resource Optimization  
**Primary Focus:** Rule-Based Cloud Resource Waste Detection  
**Cloud Platform:** Amazon Web Services (AWS)

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome. Fork the repository, create a feature branch, and submit a pull request with a clear description of your changes.

## 📄 License

A license has not yet been specified. Add an appropriate `LICENSE` file if you intend to distribute the project under an open-source license.

---

**CloudCost Guardian — Identify potential cloud waste. Make resource usage more efficient.**
