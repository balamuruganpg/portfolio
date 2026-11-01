/** Transcribed from owner-provided Certificates/ documents and their embedded proof links.
 * SHA-256 and sourceFiles retain document provenance; duplicates share one record.
 */
export interface Credential {
  id: string;
  title: string;
  issuer: string;
  platform?: string;
  kind: "Certification" | "Professional certificate" | "Course completion" | "Guided project" | "Program completion" | "Training completion";
  dateLabel: string;
  issuedOn?: string;
  expiresOn?: string;
  credentialId?: string;
  idLabel?: string;
  verificationUrl?: string;
  file: string;
  sourceFiles: string[];
  sha256: string;
  featured: boolean;
  parentId?: string;
  note?: string;
}

export const completedCredentials: Credential[] = [
  {
    "id": "oci-data-science-2025",
    "title": "Oracle Cloud Infrastructure 2025 Certified Data Science Professional",
    "issuer": "Oracle",
    "kind": "Certification",
    "dateLabel": "Sep 08, 2025",
    "credentialId": "102569553OCI25DSOCP",
    "idLabel": "Credential ID",
    "file": "/credentials/oci-data-science-2025.pdf",
    "sourceFiles": [
      "Certificates/ORACLE_/Oracle Cloud Infrastructure 2025 Certified Data Science Professional.pdf"
    ],
    "sha256": "3906ab69e10f744084e7fa731198b094844cc895baad91fc1284cb56b9c9b5f9",
    "featured": true,
    "issuedOn": "2025-09-08",
    "expiresOn": "2027-09-08"
  },
  {
    "id": "oci-generative-ai-2025",
    "title": "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional",
    "issuer": "Oracle",
    "kind": "Certification",
    "dateLabel": "Sep 02, 2025",
    "credentialId": "102497486OCI25GAIOCP",
    "idLabel": "Credential ID",
    "file": "/credentials/oci-generative-ai-2025.pdf",
    "sourceFiles": [
      "Certificates/ORACLE_/Oracle Cloud Infrastructure 2025 Certified Generative AI Professional.pdf"
    ],
    "sha256": "b2da6272b7bb72ba27a0612b2d904eb8eccee30ce103f8d733958aa315e8f482",
    "featured": true,
    "issuedOn": "2025-09-02",
    "expiresOn": "2027-09-02"
  },
  {
    "id": "oci-ai-foundations-2025",
    "title": "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
    "issuer": "Oracle",
    "kind": "Certification",
    "dateLabel": "Sep 01, 2025",
    "credentialId": "102497486OCI25AICFA",
    "idLabel": "Credential ID",
    "file": "/credentials/oci-ai-foundations-2025.pdf",
    "sourceFiles": [
      "Certificates/ORACLE_/Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate.pdf"
    ],
    "sha256": "16197107b24726261464a817bf3a215d438c588469d1dea8afa0c67762b21bb8",
    "featured": true,
    "issuedOn": "2025-09-01",
    "expiresOn": "2027-09-01"
  },
  {
    "id": "oracle-ai-vector-search",
    "title": "Oracle AI Vector Search Certified Professional",
    "issuer": "Oracle",
    "kind": "Certification",
    "dateLabel": "Sep 08, 2025",
    "credentialId": "102569553DB23AIOCP",
    "idLabel": "Credential ID",
    "file": "/credentials/oracle-ai-vector-search.pdf",
    "sourceFiles": [
      "Certificates/ORACLE_/Oracle AI Vector Search Certified Professional.pdf"
    ],
    "sha256": "25448549c77a481ca63fd84577ad9e35f43721707cee13c5c2a666116dd94792",
    "featured": true,
    "issuedOn": "2025-09-08",
    "expiresOn": "2027-09-08"
  },
  {
    "id": "ibm-data-science",
    "title": "IBM Data Science",
    "issuer": "IBM",
    "kind": "Professional certificate",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "47733K92TZFX",
    "idLabel": "Credential ID",
    "file": "/credentials/ibm-data-science.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/IBM Data Science Professional Certificate.pdf"
    ],
    "sha256": "c42ff6298bcb73f90e1e17e74406b802789885623b25fd7720f7f8c9eb0935e5",
    "featured": true,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/professional-cert/47733K92TZFX"
  },
  {
    "id": "generative-ai-leader",
    "title": "Generative AI Leader",
    "issuer": "Google Cloud",
    "kind": "Professional certificate",
    "dateLabel": "Sep 29, 2025",
    "credentialId": "1VW710KIADU0",
    "idLabel": "Credential ID",
    "file": "/credentials/generative-ai-leader.pdf",
    "sourceFiles": [
      "Certificates/GOOGLE CLOUD_/GOOGLE AI LEADER.pdf"
    ],
    "sha256": "4c1c2f343fa4e090a01ab86d2804cd54ba22ed0252c25c497259948119395a0a",
    "featured": true,
    "platform": "Coursera",
    "issuedOn": "2025-09-29",
    "verificationUrl": "https://coursera.org/verify/professional-cert/1VW710KIADU0",
    "note": "Five-course Coursera Professional Certificate; not a Google Cloud certification exam."
  },
  {
    "id": "machine-learning-with-python",
    "title": "Machine Learning with Python",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Sep 10, 2024",
    "credentialId": "DJK8QTWJJAF6",
    "idLabel": "Credential ID",
    "file": "/credentials/machine-learning-with-python.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Machine Learning with Python(DS).pdf",
      "Certificates/Coursera/Machine Learning with Python.pdf"
    ],
    "sha256": "145fe299f1e85d2a60b53d228835c78512f9734c47c55cbfab7e8aa65e435c56",
    "featured": true,
    "platform": "Coursera",
    "issuedOn": "2024-09-10",
    "verificationUrl": "https://coursera.org/verify/DJK8QTWJJAF6",
    "parentId": "ibm-data-science"
  },
  {
    "id": "google-ai-essentials",
    "title": "Google AI Essentials",
    "issuer": "Google",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "3KETLTCFYQXL",
    "idLabel": "Credential ID",
    "file": "/credentials/google-ai-essentials.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Google AI Essentials.pdf"
    ],
    "sha256": "e325111b5b6afd9a5eac2e3e2221b75bae584a7d26e936db3d64738870ec2c96",
    "featured": true,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/3KETLTCFYQXL"
  },
  {
    "id": "responsible-safe-ai-systems",
    "title": "Responsible & Safe AI Systems",
    "issuer": "NPTEL",
    "kind": "Course completion",
    "dateLabel": "Jul–Oct 2025",
    "credentialId": "NPTEL25CS118S654301980",
    "idLabel": "Roll number",
    "file": "/credentials/responsible-safe-ai-systems.pdf",
    "sourceFiles": [
      "Certificates/NPTEL/NPTEL25CS118S65430198010406637-1.pdf"
    ],
    "sha256": "0e407116ae65ecfbaa2d15c021001b724b7fe2952e904a9138752e0ef62c4c78",
    "featured": true,
    "verificationUrl": "https://nptel.ac.in/noc/E_Certificate/NPTEL25CS118S65430198010406637",
    "note": "12-week course with a proctored examination."
  },
  {
    "id": "introduction-internet-of-things",
    "title": "Introduction To Internet Of Things",
    "issuer": "NPTEL",
    "kind": "Course completion",
    "dateLabel": "Jan–Apr 2025",
    "credentialId": "NPTEL25CS44S343602569",
    "idLabel": "Roll number",
    "file": "/credentials/introduction-internet-of-things.pdf",
    "sourceFiles": [
      "Certificates/NPTEL/NPTEL25CS44S34360256904351583.pdf"
    ],
    "sha256": "4831471671f46ccc2042511492070386090db0bea80aa32e5f34bbeaab11f974",
    "featured": true,
    "verificationUrl": "https://nptel.ac.in/noc/E_Certificate/NPTEL25CS44S34360256904351583",
    "note": "12-week course with a proctored examination."
  },
  {
    "id": "entrepreneurship-startup-mastery",
    "title": "Certificate Program in Entrepreneurship and Startup Mastery",
    "issuer": "Indian Institute of Management Mumbai",
    "platform": "Masai",
    "kind": "Program completion",
    "dateLabel": "Jan 13, 2026",
    "issuedOn": "2026-01-13",
    "credentialId": "iimm_en_2507279",
    "idLabel": "Registration ID",
    "verificationUrl": "https://verify.masaischool.com/certificate/QXhMJD5pu4",
    "file": "/credentials/entrepreneurship-startup-mastery.png",
    "sourceFiles": [
      "Certificates/IIM x MASAI/QXhMJD5pu4.png"
    ],
    "sha256": "ac30ffe4bd79dde50e7b7a27a089eb0ea02b964a4a08cc1e459eeaa5c277a579",
    "featured": true,
    "note": "70-hour programme in collaboration with NSDC; programme period July–December 2025."
  },
  {
    "id": "entrepreneurship-development",
    "title": "Entrepreneurship Development",
    "issuer": "IITM Pravartak Technologies Foundation & BodhBridge Education",
    "kind": "Training completion",
    "dateLabel": "Nov 8–15, 2025",
    "file": "/credentials/entrepreneurship-development.pdf",
    "sourceFiles": [
      "Certificates/IIT BOTHBRIDGE CERIFICATE/IIT BOTHBRIDGE.pdf"
    ],
    "sha256": "52379546c46a0cc21cc422cf41b11dcfae3415b0fe15a07a8f112863233ae507",
    "featured": true,
    "verificationUrl": "https://digitalskills.iitmpravartak.org.in/iitprogram/pages/certificate/DSA102087_429.pdf",
    "note": "Training programme; grade A. IITM Pravartak is the Technology Innovation Hub of IIT Madras."
  },
  {
    "id": "ai-for-everyone",
    "title": "AI For Everyone",
    "issuer": "DeepLearning.AI",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "B3LCXLM8BO7G",
    "idLabel": "Credential ID",
    "file": "/credentials/ai-for-everyone.pdf",
    "sourceFiles": [
      "Certificates/Coursera/AI For Everyone.pdf"
    ],
    "sha256": "00090ca4c4d839beb6b5cfd675d9ff6441beec5f47197d7e4eb2c4e0b914dabd",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/B3LCXLM8BO7G"
  },
  {
    "id": "applied-data-science-capstone",
    "title": "Applied Data Science Capstone",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "T1T0PRANHXEW",
    "idLabel": "Credential ID",
    "file": "/credentials/applied-data-science-capstone.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Applied Data Science Capstone.pdf"
    ],
    "sha256": "114b28b23d99abf5f99aa06368bbcd0d0852b6e037b9146c38174ddc81b380f8",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/T1T0PRANHXEW",
    "parentId": "ibm-data-science"
  },
  {
    "id": "automate-cybersecurity-tasks-with-python",
    "title": "Automate Cybersecurity Tasks with Python",
    "issuer": "Google",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "5BSS9EVGUE49",
    "idLabel": "Credential ID",
    "file": "/credentials/automate-cybersecurity-tasks-with-python.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Automate Cybersecurity Tasks with Python.pdf"
    ],
    "sha256": "9ec9249de68b99ad02e670c295bc38d935cb361e8398d0ed6590119c045aede3",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/5BSS9EVGUE49"
  },
  {
    "id": "business-analysis-process-management",
    "title": "Business Analysis & Process Management",
    "issuer": "Coursera Project Network",
    "kind": "Guided project",
    "dateLabel": "Sep 17, 2024",
    "credentialId": "FLL0L238D321",
    "idLabel": "Credential ID",
    "file": "/credentials/business-analysis-process-management.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Business Analysis & Process Management.pdf"
    ],
    "sha256": "1858d09fc7188b2043ab4b0b44fd6e2a7d4c72b71ec8fabfd69e8c694dc6ec87",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-17",
    "verificationUrl": "https://coursera.org/verify/FLL0L238D321"
  },
  {
    "id": "cloud-computing-basics-cloud-101",
    "title": "Cloud Computing Basics (Cloud 101)",
    "issuer": "LearnQuest",
    "kind": "Course completion",
    "dateLabel": "Sep 17, 2024",
    "credentialId": "8IKHBJIBHC9W",
    "idLabel": "Credential ID",
    "file": "/credentials/cloud-computing-basics-cloud-101.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Cloud Computing Basics (Cloud 101).pdf"
    ],
    "sha256": "c0bebfbd86374ae5ffb8e768fac7c9b5ca6311589cfab2438fe7879408d07337",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-17",
    "verificationUrl": "https://coursera.org/verify/8IKHBJIBHC9W"
  },
  {
    "id": "data-analysis-with-python",
    "title": "Data Analysis with Python",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "6WV2AOROBL56",
    "idLabel": "Credential ID",
    "file": "/credentials/data-analysis-with-python.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Data Analysis with Python.pdf"
    ],
    "sha256": "da438b2648c066b7af9d28ebc986eec8153997a58547441fce3042d74e28b283",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/6WV2AOROBL56",
    "parentId": "ibm-data-science"
  },
  {
    "id": "data-science-methodology",
    "title": "Data Science Methodology",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "TWU6NV56E0K1",
    "idLabel": "Credential ID",
    "file": "/credentials/data-science-methodology.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Data Science Methodology.pdf"
    ],
    "sha256": "37e2001bf618dc8fee540873ac84b521e02bb481b12f48cbe81ff9305fd75c1d",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/TWU6NV56E0K1",
    "parentId": "ibm-data-science"
  },
  {
    "id": "data-scientist-career-guide-and-interview-preparation",
    "title": "Data Scientist Career Guide and Interview Preparation",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "2AL170OJORU6",
    "idLabel": "Credential ID",
    "file": "/credentials/data-scientist-career-guide-and-interview-preparation.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Data Scientist Career.pdf"
    ],
    "sha256": "5ff0f3573c6735bc9031a9a03a1a2023eb57913387a7cc672b253b80ff027710",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/2AL170OJORU6",
    "parentId": "ibm-data-science"
  },
  {
    "id": "data-visualization-with-python",
    "title": "Data Visualization with Python",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "RNJEMZ7H6KEV",
    "idLabel": "Credential ID",
    "file": "/credentials/data-visualization-with-python.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Data Visualization with Python.pdf"
    ],
    "sha256": "3b4a88781c94eff311abf5819fee174cd639359ddbefae3093ea0e677cc79267",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/RNJEMZ7H6KEV",
    "parentId": "ibm-data-science"
  },
  {
    "id": "databases-and-sql-for-data-science-with-python",
    "title": "Databases and SQL for Data Science with Python",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "DI09V9IGC8Z4",
    "idLabel": "Credential ID",
    "file": "/credentials/databases-and-sql-for-data-science-with-python.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Databases and SQL for Data Science with Python.pdf"
    ],
    "sha256": "f98c747d98c8cdf33a6ced88fad7a7f6af0429f28dcb86d534a3422778986492",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/DI09V9IGC8Z4",
    "parentId": "ibm-data-science"
  },
  {
    "id": "essentials-of-entrepreneurship-thinking-action",
    "title": "Essentials of Entrepreneurship: Thinking & Action",
    "issuer": "University of California, Irvine",
    "kind": "Course completion",
    "dateLabel": "Oct 2, 2024",
    "credentialId": "KW4I8RP6QSBN",
    "idLabel": "Credential ID",
    "file": "/credentials/essentials-of-entrepreneurship-thinking-action.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Essentials of Entrepreneurship thining action.pdf"
    ],
    "sha256": "b4abf663f067e47f1630941ec2e4506c47ae4d75bf5d637bfe2f53c98780f9d9",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-02",
    "verificationUrl": "https://coursera.org/verify/KW4I8RP6QSBN"
  },
  {
    "id": "foundations-of-cybersecurity",
    "title": "Foundations of Cybersecurity",
    "issuer": "Google",
    "kind": "Course completion",
    "dateLabel": "Oct 1, 2024",
    "credentialId": "TKDBFVC4T6O3",
    "idLabel": "Credential ID",
    "file": "/credentials/foundations-of-cybersecurity.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Foundations of Cybersecurity.pdf"
    ],
    "sha256": "d55049a467b813a2e239f29198d9c423d1c65597cf5ed3ec804c1381dc3ea02b",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-01",
    "verificationUrl": "https://coursera.org/verify/TKDBFVC4T6O3"
  },
  {
    "id": "generative-ai-elevate-your-data-science-career",
    "title": "Generative AI: Elevate Your Data Science Career",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "A0LSZD8A786A",
    "idLabel": "Credential ID",
    "file": "/credentials/generative-ai-elevate-your-data-science-career.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Generative AI Elevate Your Data Science Career.pdf"
    ],
    "sha256": "ee306d1e30141ac8a69dff30e5e3a0c24fe9e3888cfb2971745a40967e5463af",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/A0LSZD8A786A",
    "parentId": "ibm-data-science"
  },
  {
    "id": "generative-ai-introduction-and-applications",
    "title": "Generative AI: Introduction and Applications",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "UNM70MD9IRMS",
    "idLabel": "Credential ID",
    "file": "/credentials/generative-ai-introduction-and-applications.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Generative AI (Introduction and applications).pdf"
    ],
    "sha256": "e58440870155c445df841a46e973d2ecc5a704d078e3520a927c651d6e3ede57",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/UNM70MD9IRMS"
  },
  {
    "id": "introduction-to-android-mobile-application-development",
    "title": "Introduction to Android Mobile Application Development",
    "issuer": "Meta",
    "kind": "Course completion",
    "dateLabel": "Sep 28, 2024",
    "credentialId": "P0NYWSLIVFBV",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-android-mobile-application-development.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to Android Mobile Application De.pdf"
    ],
    "sha256": "039d717d2056546e5b5ebf94fda9c93296ce4fee4a578cddd0d2649ea33fb6c0",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-28",
    "verificationUrl": "https://coursera.org/verify/P0NYWSLIVFBV"
  },
  {
    "id": "introduction-to-artificial-intelligence-ai",
    "title": "Introduction to Artificial Intelligence (AI)",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Sep 26, 2024",
    "credentialId": "E7GBJKRMCWQK",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-artificial-intelligence-ai.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to Artificial Intelligence (AI).pdf"
    ],
    "sha256": "bd238106596c9af95b3613165cb854a8322aedc819d5a554f9a373279724c96b",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-26",
    "verificationUrl": "https://coursera.org/verify/E7GBJKRMCWQK"
  },
  {
    "id": "introduction-to-back-end-development",
    "title": "Introduction to Back-End Development",
    "issuer": "Meta",
    "kind": "Course completion",
    "dateLabel": "Sep 27, 2024",
    "credentialId": "FHCSSHB2SO8H",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-back-end-development.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to back-end Development.pdf"
    ],
    "sha256": "ff244325be4a19395c2d619b295368d6d53f44ba00d79985e89adc951e5b6910",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-27",
    "verificationUrl": "https://coursera.org/verify/FHCSSHB2SO8H"
  },
  {
    "id": "introduction-to-blockchain-technologies",
    "title": "Introduction to Blockchain Technologies",
    "issuer": "INSEAD",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "67BU60QGIF59",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-blockchain-technologies.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to Blockchain Technologies.pdf"
    ],
    "sha256": "295f8243429fcf617b0d41d80a527c070ea704a53e891d34531c381c1352563d",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/67BU60QGIF59"
  },
  {
    "id": "introduction-to-cloud-computing",
    "title": "Introduction to Cloud Computing",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Sep 26, 2024",
    "credentialId": "JYEY616ARPRK",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-cloud-computing.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to cloud computing.pdf"
    ],
    "sha256": "bfe868d8c96812fbbb85173467dfd2d812ec03c1cca519259c6cc45f491ee302",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-26",
    "verificationUrl": "https://coursera.org/verify/JYEY616ARPRK"
  },
  {
    "id": "introduction-to-data-analytics",
    "title": "Introduction to Data Analytics",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 2, 2024",
    "credentialId": "WRVV9PQP0RCW",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-data-analytics.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction to Data Analytics.pdf"
    ],
    "sha256": "379ba06a8a91eda877533083cf4c7f81374eb2e6fada5a8213b3e9b0e79bd9c6",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-02",
    "verificationUrl": "https://coursera.org/verify/WRVV9PQP0RCW"
  },
  {
    "id": "introduction-to-front-end-development",
    "title": "Introduction to Front-End Development",
    "issuer": "Meta",
    "kind": "Course completion",
    "dateLabel": "Sep 27, 2024",
    "credentialId": "U1PCBCFUG9HI",
    "idLabel": "Credential ID",
    "file": "/credentials/introduction-to-front-end-development.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Introduction To Front-end Development.pdf"
    ],
    "sha256": "f5f990621b3969b01979e8b6be184f0c202cb6c66f349acfc80a65737df4a771",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-27",
    "verificationUrl": "https://coursera.org/verify/U1PCBCFUG9HI"
  },
  {
    "id": "linux-fundamentals",
    "title": "Linux Fundamentals",
    "issuer": "LearnQuest",
    "kind": "Course completion",
    "dateLabel": "Oct 1, 2024",
    "credentialId": "GDUMMK0I5QEO",
    "idLabel": "Credential ID",
    "file": "/credentials/linux-fundamentals.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Linux Fundamentals.pdf"
    ],
    "sha256": "354c10f1ae54173b165d7dc88340274fdcc1b76c0b7182fcf01f7690ca82347a",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-01",
    "verificationUrl": "https://coursera.org/verify/GDUMMK0I5QEO"
  },
  {
    "id": "machine-learning-introduction-for-everyone",
    "title": "Machine Learning Introduction for Everyone",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "32M793R0R8OB",
    "idLabel": "Credential ID",
    "file": "/credentials/machine-learning-introduction-for-everyone.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Machine Learning Introduction for Everyone.pdf"
    ],
    "sha256": "f8ae65d245e1b324e7e57c21fab2f1c8b6d902e9e3380d3483de41e4e2f048e0",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/32M793R0R8OB"
  },
  {
    "id": "positive-psychology",
    "title": "Positive Psychology",
    "issuer": "The University of North Carolina at Chapel Hill",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "25AX4UK6E9TR",
    "idLabel": "Credential ID",
    "file": "/credentials/positive-psychology.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Positive Psychology.pdf"
    ],
    "sha256": "00b2e2e34c9c7f9a871292f12dc7e050db5980985f754cd17526fa1c8a0aa6ca",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/25AX4UK6E9TR"
  },
  {
    "id": "power-bi-power-virtual-agents",
    "title": "Power BI & Power Virtual Agents",
    "issuer": "Microsoft",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "6B6NKUNZNIZZ",
    "idLabel": "Credential ID",
    "file": "/credentials/power-bi-power-virtual-agents.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Power BI & Power Virtual Agents.pdf"
    ],
    "sha256": "0d6e5339e778b979e136fa6813256e6a29f0cc51f36e35942e889571e16b6453",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/6B6NKUNZNIZZ"
  },
  {
    "id": "principles-and-technologies-of-5g-mobile-networks",
    "title": "Principles and Technologies of 5G Mobile Networks",
    "issuer": "LearnQuest",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "RHW0HI7SBRS5",
    "idLabel": "Credential ID",
    "file": "/credentials/principles-and-technologies-of-5g-mobile-networks.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Principles and Technologies of 5g.pdf"
    ],
    "sha256": "756da4400865d590fdbc6d7885d635476781808732ca656401eb58cf150b89e2",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/RHW0HI7SBRS5"
  },
  {
    "id": "python-for-data-science-ai-development",
    "title": "Python for Data Science, AI & Development",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Sep 8, 2024",
    "credentialId": "MG3MWRP90D8A",
    "idLabel": "Credential ID",
    "file": "/credentials/python-for-data-science-ai-development.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Python for Data Science, AI & Development(DS).pdf",
      "Certificates/Coursera/Python for Data Science, AI & Development.pdf"
    ],
    "sha256": "2ffa920258c1aff0e04fd2e236df8ffd6dda9a61ff611835b73acb184b98f2aa",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-08",
    "verificationUrl": "https://coursera.org/verify/MG3MWRP90D8A",
    "parentId": "ibm-data-science"
  },
  {
    "id": "python-project-for-data-science",
    "title": "Python Project for Data Science",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "HSH5N02H087L",
    "idLabel": "Credential ID",
    "file": "/credentials/python-project-for-data-science.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Python Project for Data Science.pdf"
    ],
    "sha256": "ad8e46404ca0d53926c5784f883ef69b7761a3ca3790d5687d2dd85f8ffbf507",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/HSH5N02H087L",
    "parentId": "ibm-data-science"
  },
  {
    "id": "the-entrepreneur-s-guide-for-beginners",
    "title": "The entrepreneur's guide for beginners",
    "issuer": "Universitat de Barcelona",
    "kind": "Course completion",
    "dateLabel": "Sep 19, 2024",
    "credentialId": "E8SKI2Q5ZEFE",
    "idLabel": "Credential ID",
    "file": "/credentials/the-entrepreneur-s-guide-for-beginners.pdf",
    "sourceFiles": [
      "Certificates/Coursera/The Entrepreneurs Guide for Beginners.pdf"
    ],
    "sha256": "3924b4a850bb3890cc871b934c2a4aaf2a0f611612e581f3ba4406684d73fd5f",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-19",
    "verificationUrl": "https://coursera.org/verify/E8SKI2Q5ZEFE"
  },
  {
    "id": "the-science-of-well-being",
    "title": "The Science of Well-Being",
    "issuer": "Yale University",
    "kind": "Course completion",
    "dateLabel": "Oct 8, 2024",
    "credentialId": "6G3VMC7YC0NN",
    "idLabel": "Credential ID",
    "file": "/credentials/the-science-of-well-being.pdf",
    "sourceFiles": [
      "Certificates/Coursera/The Science of Well-Being.pdf"
    ],
    "sha256": "69983e133f81b3f22d186272146cd7a49f657e958422125124cb1cf42b54b101",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-08",
    "verificationUrl": "https://coursera.org/verify/6G3VMC7YC0NN"
  },
  {
    "id": "tools-for-data-science",
    "title": "Tools for Data Science",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 10, 2024",
    "credentialId": "58AUU0S8EMJO",
    "idLabel": "Credential ID",
    "file": "/credentials/tools-for-data-science.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/Tools for Data Science.pdf"
    ],
    "sha256": "ed903544bcad2064f278a6e4a17726e9d9034ce31b7eba09adc2d8ff066f995f",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-10",
    "verificationUrl": "https://coursera.org/verify/58AUU0S8EMJO",
    "parentId": "ibm-data-science"
  },
  {
    "id": "what-is-data-science",
    "title": "What is Data Science?",
    "issuer": "IBM",
    "kind": "Course completion",
    "dateLabel": "Oct 9, 2024",
    "credentialId": "X9J87EXBE7GC",
    "idLabel": "Credential ID",
    "file": "/credentials/what-is-data-science.pdf",
    "sourceFiles": [
      "Certificates/Coursera/IBM DATA SCIENCE PROFESSIONAL CERTIFICATE_/What is Data Science.pdf"
    ],
    "sha256": "60acd6490f59d5417681ee11f8e35e9bd5871f8383eaa6a165b09639c586695a",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-10-09",
    "verificationUrl": "https://coursera.org/verify/X9J87EXBE7GC",
    "parentId": "ibm-data-science"
  },
  {
    "id": "work-smarter-with-microsoft-excel",
    "title": "Work Smarter with Microsoft Excel",
    "issuer": "Microsoft",
    "kind": "Course completion",
    "dateLabel": "Sep 28, 2024",
    "credentialId": "DLOAAMJ2HKUS",
    "idLabel": "Credential ID",
    "file": "/credentials/work-smarter-with-microsoft-excel.pdf",
    "sourceFiles": [
      "Certificates/Coursera/Work Smarter with Microsoft Excel.pdf"
    ],
    "sha256": "d9f04a5fa5f6f6bca23fd329febc7748672274218e50419992d2b13a50943687",
    "featured": false,
    "platform": "Coursera",
    "issuedOn": "2024-09-28",
    "verificationUrl": "https://coursera.org/verify/DLOAAMJ2HKUS"
  }
];

// Owner-confirmed learning status; deliberately excluded from completed credentials.
export const inProgressCredentials = [{
  id: "deep-learning-specialization",
  title: "Deep Learning Specialization",
  issuer: "DeepLearning.AI · Andrew Ng",
  status: "In progress" as const,
  note: "Currently studying; completion proof will be added when earned.",
}];
