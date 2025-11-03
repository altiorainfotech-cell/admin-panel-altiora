// Predefined pages data structure for Altiora Infotech website
// This contains all 57 pages that need SEO management

export interface PredefinedPage {
  path: string;
  defaultSlug: string;
  category: 'main' | 'services' | 'blog' | 'about' | 'contact' | 'other';
  defaultTitle: string;
  defaultDescription: string;
}

export const PREDEFINED_PAGES: PredefinedPage[] = [
  // Main pages
  {
    path: '/',
    defaultSlug: 'home',
    category: 'main',
    defaultTitle: 'Altiora Infotech - AI, Web3 & Growth Engineering Solutions',
    defaultDescription: 'Leading AI, Web3, and growth engineering solutions for modern businesses. Transform your digital presence with cutting-edge technology.'
  },
  {
    path: '/about',
    defaultSlug: 'about-us',
    category: 'about',
    defaultTitle: 'About Altiora Infotech - Innovation & Excellence',
    defaultDescription: 'Learn about Altiora Infotech\'s mission to deliver innovative AI, Web3, and growth engineering solutions for businesses worldwide.'
  },
  {
    path: '/services',
    defaultSlug: 'services',
    category: 'main',
    defaultTitle: 'Services - AI, Web3 & Development Solutions | Altiora Infotech',
    defaultDescription: 'Comprehensive AI, Web3, and development services to transform your business with cutting-edge technology solutions.'
  },
  {
    path: '/projects',
    defaultSlug: 'projects',
    category: 'main',
    defaultTitle: 'Projects - Portfolio & Case Studies | Altiora Infotech',
    defaultDescription: 'Explore our portfolio of successful AI, Web3, and development projects with detailed case studies and results.'
  },
  {
    path: '/blog',
    defaultSlug: 'blog',
    category: 'blog',
    defaultTitle: 'Blog - Latest Insights on AI, Web3 & Technology | Altiora Infotech',
    defaultDescription: 'Stay updated with the latest insights, trends, and tutorials on AI, Web3, blockchain, and modern technology from Altiora Infotech experts.'
  },
  {
    path: '/contact',
    defaultSlug: 'contact-us',
    category: 'contact',
    defaultTitle: 'Contact Altiora Infotech - Get In Touch',
    defaultDescription: 'Contact Altiora Infotech for AI, Web3, and growth engineering solutions. Let\'s discuss your project requirements.'
  },
  {
    path: '/staff',
    defaultSlug: 'staff',
    category: 'about',
    defaultTitle: 'Our Team - Expert Staff at Altiora Infotech',
    defaultDescription: 'Meet our expert team of AI, Web3, and development professionals at Altiora Infotech.'
  },
  {
    path: '/testimonials',
    defaultSlug: 'testimonials',
    category: 'about',
    defaultTitle: 'Client Testimonials - Success Stories | Altiora Infotech',
    defaultDescription: 'Read testimonials and success stories from our satisfied clients who have transformed their businesses with our solutions.'
  },
  {
    path: '/faq',
    defaultSlug: 'faq',
    category: 'other',
    defaultTitle: 'FAQ - Frequently Asked Questions | Altiora Infotech',
    defaultDescription: 'Find answers to frequently asked questions about our AI, Web3, and development services at Altiora Infotech.'
  },
  {
    path: '/gamify',
    defaultSlug: 'gamify',
    category: 'other',
    defaultTitle: 'Gamification Solutions - Engage & Motivate | Altiora Infotech',
    defaultDescription: 'Transform user engagement with our gamification solutions that motivate and drive user behavior.'
  },

  // AI/ML Services
  {
    path: '/services/ai-ml',
    defaultSlug: 'ai-ml-services',
    category: 'services',
    defaultTitle: 'AI & ML Services - Machine Learning Solutions | Altiora Infotech',
    defaultDescription: 'Comprehensive AI and machine learning services to transform your business with intelligent automation and data-driven insights.'
  },
  {
    path: '/services/ai-ml/agentic-ai',
    defaultSlug: 'agentic-ai',
    category: 'services',
    defaultTitle: 'Agentic AI Solutions - Autonomous AI Agents | Altiora Infotech',
    defaultDescription: 'Advanced agentic AI solutions with autonomous agents that can perform complex tasks and make intelligent decisions.'
  },
  {
    path: '/services/ai-ml/ai-infrastructure-and-cloud-development',
    defaultSlug: 'ai-infrastructure-and-cloud-development',
    category: 'services',
    defaultTitle: 'AI Infrastructure & Cloud Development | Altiora Infotech',
    defaultDescription: 'Scalable AI infrastructure and cloud development services for robust machine learning deployments and operations.'
  },
  {
    path: '/services/ai-ml/ai-services-that-ship-scale-and-prove-roi',
    defaultSlug: 'ai-services-that-ship-scale-and-prove-roi',
    category: 'services',
    defaultTitle: 'AI Services That Ship, Scale & Prove ROI | Altiora Infotech',
    defaultDescription: 'Production-ready AI services designed to ship fast, scale efficiently, and deliver measurable ROI for your business.'
  },
  {
    path: '/services/ai-ml/computer-vision',
    defaultSlug: 'computer-vision-services',
    category: 'services',
    defaultTitle: 'Computer Vision Services - Image & Video Analysis',
    defaultDescription: 'Computer vision solutions for image recognition, object detection, and automated visual analysis applications.'
  },
  {
    path: '/services/ai-ml/data-strategy-and-engineering-page',
    defaultSlug: 'data-strategy-and-engineering',
    category: 'services',
    defaultTitle: 'Data Strategy & Engineering Services | Altiora Infotech',
    defaultDescription: 'Comprehensive data strategy and engineering services to build robust data pipelines and analytics infrastructure.'
  },
  {
    path: '/services/ai-ml/generative-ai',
    defaultSlug: 'generative-ai',
    category: 'services',
    defaultTitle: 'Generative AI Services - Creative AI Solutions | Altiora Infotech',
    defaultDescription: 'Generative AI services for content creation, image generation, and creative automation using advanced AI models.'
  },
  {
    path: '/services/ai-ml/machine-learning',
    defaultSlug: 'machine-learning',
    category: 'services',
    defaultTitle: 'Machine Learning Services | Custom ML Solutions',
    defaultDescription: 'Custom machine learning services for predictive analytics, automation, and intelligent business solutions.'
  },
  {
    path: '/services/ai-ml/natural-language-processing-ai',
    defaultSlug: 'natural-language-processing-ai',
    category: 'services',
    defaultTitle: 'Natural Language Processing AI Services | NLP Solutions',
    defaultDescription: 'Advanced NLP and AI services for text analysis, chatbots, sentiment analysis, and language understanding applications.'
  },
  {
    path: '/services/ai-ml/predictive-analytics-and-automation',
    defaultSlug: 'predictive-analytics-and-automation',
    category: 'services',
    defaultTitle: 'Predictive Analytics & Automation Services | Altiora Infotech',
    defaultDescription: 'Predictive analytics and automation services to forecast trends and automate business processes with AI.'
  },

  // Web2 Services
  {
    path: '/services/web2',
    defaultSlug: 'web2-services',
    category: 'services',
    defaultTitle: 'Web2 Development Services - Traditional Web Solutions',
    defaultDescription: 'Comprehensive Web2 development services for traditional web applications, APIs, and digital solutions.'
  },
  {
    path: '/services/web2/api-development-integration',
    defaultSlug: 'api-development-integration',
    category: 'services',
    defaultTitle: 'API Development & Integration Services | Altiora Infotech',
    defaultDescription: 'Professional API development and integration services for seamless system connectivity and data exchange.'
  },
  {
    path: '/services/web2/cloud-migration-managed-hosting',
    defaultSlug: 'cloud-migration-managed-hosting',
    category: 'services',
    defaultTitle: 'Cloud Migration & Managed Hosting Services | Altiora Infotech',
    defaultDescription: 'Expert cloud migration and managed hosting services for scalable, secure, and reliable infrastructure.'
  },
  {
    path: '/services/web2/custom-web-application-development',
    defaultSlug: 'custom-web-application-development',
    category: 'services',
    defaultTitle: 'Custom Web Application Development | Altiora Infotech',
    defaultDescription: 'Custom web application development services tailored to your business needs with modern technologies.'
  },
  {
    path: '/services/web2/devops-consulting',
    defaultSlug: 'devops-consulting',
    category: 'services',
    defaultTitle: 'DevOps Consulting Services - CI/CD & Automation | Altiora Infotech',
    defaultDescription: 'DevOps consulting services for continuous integration, deployment automation, and infrastructure optimization.'
  },
  {
    path: '/services/web2/e-commerce-development',
    defaultSlug: 'e-commerce-development',
    category: 'services',
    defaultTitle: 'E-commerce Development Services - Online Store Solutions',
    defaultDescription: 'Custom e-commerce development services for online stores, marketplaces, and digital commerce platforms.'
  },
  {
    path: '/services/web2/headless-cms-content-ops',
    defaultSlug: 'headless-cms-content-ops',
    category: 'services',
    defaultTitle: 'Headless CMS & Content Operations | Altiora Infotech',
    defaultDescription: 'Headless CMS and content operations services for flexible, scalable content management solutions.'
  },
  {
    path: '/services/web2/mobile-application-development',
    defaultSlug: 'mobile-application-development',
    category: 'services',
    defaultTitle: 'Mobile Application Development - iOS & Android Apps',
    defaultDescription: 'Professional mobile application development services for iOS and Android platforms with native and cross-platform solutions.'
  },
  {
    path: '/services/web2/qa-automation',
    defaultSlug: 'qa-automation',
    category: 'services',
    defaultTitle: 'QA Automation Services - Testing & Quality Assurance',
    defaultDescription: 'Comprehensive QA automation services for testing, quality assurance, and continuous integration workflows.'
  },
  {
    path: '/services/web2/saas-application-development',
    defaultSlug: 'saas-application-development',
    category: 'services',
    defaultTitle: 'SaaS Application Development Services | Altiora Infotech',
    defaultDescription: 'SaaS application development services for scalable, multi-tenant software solutions with modern architecture.'
  },
  {
    path: '/services/web2/ui-ux-design',
    defaultSlug: 'ui-ux-design',
    category: 'services',
    defaultTitle: 'UI/UX Design Services - User Experience & Interface Design',
    defaultDescription: 'Professional UI/UX design services for web and mobile applications with focus on user experience and modern design principles.'
  },

  // Web3 Services
  {
    path: '/services/web3',
    defaultSlug: 'web3-services',
    category: 'services',
    defaultTitle: 'Web3 Development Services - Blockchain & DeFi Solutions',
    defaultDescription: 'Complete Web3 development services including blockchain, DeFi, NFTs, and decentralized application development.'
  },
  {
    path: '/services/web3/blockchain',
    defaultSlug: 'blockchain',
    category: 'services',
    defaultTitle: 'Blockchain Development Services | Altiora Infotech',
    defaultDescription: 'Expert blockchain development services for distributed ledger technology, smart contracts, and decentralized solutions.'
  },
  {
    path: '/services/web3/blockchain-development-services-building-the-future-of-web3-with-altiora-infotech',
    defaultSlug: 'blockchain-development-services-building-the-future-of-web3-with-altiora-infotech',
    category: 'services',
    defaultTitle: 'Blockchain Development Services - Building the Future of Web3 | Altiora Infotech',
    defaultDescription: 'Expert blockchain development services for Web3 applications, smart contracts, and decentralized solutions. Build the future with Altiora Infotech.'
  },
  {
    path: '/services/web3/security-audit',
    defaultSlug: 'security-audit',
    category: 'services',
    defaultTitle: 'Web3 Security Audit Services | Smart Contract Auditing',
    defaultDescription: 'Comprehensive Web3 security audit services for smart contracts, DeFi protocols, and blockchain applications.'
  },
  {
    path: '/services/web3/tokenization',
    defaultSlug: 'tokenization',
    category: 'services',
    defaultTitle: 'Tokenization Services - Asset Tokenization | Altiora Infotech',
    defaultDescription: 'Asset tokenization services to convert real-world assets into blockchain tokens for enhanced liquidity and accessibility.'
  },
  {
    path: '/services/web3/dao',
    defaultSlug: 'dao',
    category: 'services',
    defaultTitle: 'DAO Development Services - Decentralized Autonomous Organizations',
    defaultDescription: 'DAO development services for creating decentralized autonomous organizations with governance tokens and voting mechanisms.'
  },
  {
    path: '/services/web3/nft',
    defaultSlug: 'nft',
    category: 'services',
    defaultTitle: 'NFT Development Services - Non-Fungible Tokens | Altiora Infotech',
    defaultDescription: 'NFT development services for creating, minting, and trading non-fungible tokens with custom marketplace solutions.'
  },
  {
    path: '/services/web3/smart-contract',
    defaultSlug: 'smart-contract',
    category: 'services',
    defaultTitle: 'Smart Contract Development Services | Ethereum & Solidity',
    defaultDescription: 'Professional smart contract development services for Ethereum, Binance Smart Chain, and other blockchain platforms.'
  },
  {
    path: '/services/web3/dapp',
    defaultSlug: 'dapp',
    category: 'services',
    defaultTitle: 'DApp Development Services - Decentralized Applications',
    defaultDescription: 'Decentralized application development services for Web3 platforms with user-friendly interfaces and robust functionality.'
  },
  {
    path: '/services/web3/web3-marketing',
    defaultSlug: 'web3-marketing',
    category: 'services',
    defaultTitle: 'Web3 Marketing Services - Blockchain Marketing | Altiora Infotech',
    defaultDescription: 'Specialized Web3 marketing services for blockchain projects, DeFi protocols, and cryptocurrency ventures.'
  },
  {
    path: '/services/web3/wallet',
    defaultSlug: 'wallet',
    category: 'services',
    defaultTitle: 'Crypto Wallet Development Services | Web3 Wallets',
    defaultDescription: 'Secure crypto wallet development services for Web3 applications with multi-chain support and advanced security features.'
  },
  {
    path: '/services/web3/zk-privacy',
    defaultSlug: 'zk-privacy',
    category: 'services',
    defaultTitle: 'Zero-Knowledge Privacy Solutions | ZK-Proofs | Altiora Infotech',
    defaultDescription: 'Zero-knowledge privacy solutions and ZK-proof implementations for enhanced blockchain privacy and security.'
  },
  {
    path: '/services/web3/defi',
    defaultSlug: 'defi',
    category: 'services',
    defaultTitle: 'DeFi Development Services - Decentralized Finance Solutions',
    defaultDescription: 'DeFi development services for decentralized exchanges, lending platforms, yield farming, and financial protocols.'
  },

  // Special Pages
  {
    path: '/ai-ml/demo-page',
    defaultSlug: 'ai-ml-demo-page',
    category: 'other',
    defaultTitle: 'AI/ML Demo Page - Interactive Demonstrations | Altiora Infotech',
    defaultDescription: 'Interactive AI/ML demonstrations showcasing our capabilities in artificial intelligence and machine learning solutions.'
  },
  {
    path: '/depin',
    defaultSlug: 'depin',
    category: 'other',
    defaultTitle: 'DePIN Solutions - Decentralized Physical Infrastructure | Altiora Infotech',
    defaultDescription: 'DePIN (Decentralized Physical Infrastructure Network) solutions for distributed infrastructure and IoT applications.'
  },
  {
    path: '/rwa',
    defaultSlug: 'rwa',
    category: 'other',
    defaultTitle: 'RWA Solutions - Real World Assets Tokenization | Altiora Infotech',
    defaultDescription: 'Real World Assets (RWA) tokenization solutions for bringing traditional assets onto blockchain platforms.'
  },
  {
    path: '/web3-deck',
    defaultSlug: 'web3-deck',
    category: 'other',
    defaultTitle: 'Web3 Deck - Blockchain Presentation | Altiora Infotech',
    defaultDescription: 'Comprehensive Web3 and blockchain presentation deck showcasing our expertise and service offerings.'
  },
  {
    path: '/pitch-deck',
    defaultSlug: 'pitch-deck',
    category: 'other',
    defaultTitle: 'Pitch Deck - Company Overview | Altiora Infotech',
    defaultDescription: 'Company pitch deck presenting Altiora Infotech\'s vision, services, and value proposition for potential clients and partners.'
  },

  // Legal Pages
  {
    path: '/privacy-policy',
    defaultSlug: 'privacy-policy',
    category: 'other',
    defaultTitle: 'Privacy Policy - Altiora Infotech',
    defaultDescription: 'Privacy policy for Altiora Infotech outlining how we collect, use, and protect your personal information and data.'
  },
  {
    path: '/terms-conditions',
    defaultSlug: 'terms-conditions',
    category: 'other',
    defaultTitle: 'Terms & Conditions - Altiora Infotech',
    defaultDescription: 'Terms and conditions for Altiora Infotech services including usage guidelines, limitations, and legal agreements.'
  },

  // Blog Posts
  {
    path: '/blog/your-internet-access-is-at-risk-were-speaking-up',
    defaultSlug: 'your-internet-access-is-at-risk-were-speaking-up',
    category: 'blog',
    defaultTitle: 'Your Internet Access is at Risk - We\'re Speaking Up | Altiora Infotech Blog',
    defaultDescription: 'Learn about the risks to internet access and why we\'re advocating for digital rights and open internet policies.'
  },
  {
    path: '/blog/gemini-nano-banana',
    defaultSlug: 'gemini-nano-banana',
    category: 'blog',
    defaultTitle: 'Gemini Nano Banana - AI Innovation Insights | Altiora Infotech Blog',
    defaultDescription: 'Explore the latest AI innovation insights and developments in the Gemini Nano ecosystem and its applications.'
  },
  {
    path: '/blog/mobile-app-trends-2025',
    defaultSlug: 'mobile-app-trends-2025',
    category: 'blog',
    defaultTitle: 'Mobile App Trends 2025 - Future of Mobile Development | Altiora Infotech',
    defaultDescription: 'Discover the top mobile app trends for 2025 and how they will shape the future of mobile application development.'
  },
  {
    path: '/blog/ai-ml-2030-everyday-things',
    defaultSlug: 'ai-ml-2030-everyday-things',
    category: 'blog',
    defaultTitle: 'AI/ML 2030: Everyday Things - Future Predictions | Altiora Infotech',
    defaultDescription: 'Explore how AI and machine learning will transform everyday objects and experiences by 2030.'
  },
  {
    path: '/blog/future-of-digital-success-website-that-works',
    defaultSlug: 'future-of-digital-success-website-that-works',
    category: 'blog',
    defaultTitle: 'Future of Digital Success: Website That Works | Altiora Infotech',
    defaultDescription: 'Learn about the future of digital success and how to build websites that truly work for your business goals.'
  },
  {
    path: '/blog/hyperautomation-ai-ml',
    defaultSlug: 'hyperautomation-ai-ml',
    category: 'blog',
    defaultTitle: 'Hyperautomation with AI/ML - Business Transformation | Altiora Infotech',
    defaultDescription: 'Discover how hyperautomation powered by AI and ML can transform your business processes and operations.'
  },
  {
    path: '/blog/ai-workflows-small-enterprises',
    defaultSlug: 'ai-workflows-small-enterprises',
    category: 'blog',
    defaultTitle: 'AI Workflows for Small Enterprises - Automation Guide | Altiora Infotech',
    defaultDescription: 'Complete guide to implementing AI workflows in small enterprises for improved efficiency and productivity.'
  },
  {
    path: '/blog/ux-ui-for-ai-apps',
    defaultSlug: 'ux-ui-for-ai-apps',
    category: 'blog',
    defaultTitle: 'UX/UI for AI Apps - Design Best Practices | Altiora Infotech',
    defaultDescription: 'Best practices for designing user experiences and interfaces for AI-powered applications and platforms.'
  }
];

// Helper functions for working with predefined pages
export const getPredefinedPageByPath = (path: string): PredefinedPage | undefined => {
  return PREDEFINED_PAGES.find(page => page.path === path);
};

export const getPredefinedPageBySlug = (slug: string): PredefinedPage | undefined => {
  return PREDEFINED_PAGES.find(page => page.defaultSlug === slug);
};

export const getPredefinedPagesByCategory = (category: string): PredefinedPage[] => {
  return PREDEFINED_PAGES.filter(page => page.category === category);
};

export const getAllPredefinedPaths = (): string[] => {
  return PREDEFINED_PAGES.map(page => page.path);
};

export const getAllPredefinedSlugs = (): string[] => {
  return PREDEFINED_PAGES.map(page => page.defaultSlug);
};