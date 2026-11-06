const Member = require('../models/Member');
const Donation = require('../models/Donation');
const CollectionAgent = require('../models/CollectionAgent');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');

const seedInitialData = async () => {
  try {
    // 1. Seed Members if empty
    const memberCount = await Member.countDocuments();
    if (memberCount === 0) {
      await Member.create([
        {
          id: 'CKF-M-001',
          name: 'Shyamasundar Das',
          address1: 'House 14, Harisabha Para',
          address2: 'Near Ganga Ghat',
          city: 'Nabadwip',
          postOffice: 'Nabadwip',
          district: 'Nadia',
          state: 'West Bengal',
          pincode: '741302',
          country: 'India',
          mobile1: '9832104512',
          mobile2: '9474905910',
          email: 'shyamasundar@example.com',
          category: 'Life Member',
          status: 'Active',
          totalDonations: 11000,
        },
        {
          id: 'CKF-M-002',
          name: 'Anandamayee Devi',
          address1: 'Bowbazar Road, Ward 5',
          address2: 'Opposite Radha Madan Mohan Mandir',
          city: 'Nabadwip',
          postOffice: 'Nabadwip',
          district: 'Nadia',
          state: 'West Bengal',
          pincode: '741302',
          country: 'India',
          mobile1: '9679014230',
          mobile2: '',
          email: 'anandamayee@example.com',
          category: 'Patron',
          status: 'Active',
          totalDonations: 5001,
        },
        {
          id: 'CKF-M-003',
          name: 'Gouranga Charan Chakraborty',
          address1: 'College Para, Main Road',
          address2: 'Near Nabadwip Vidyasagar College',
          city: 'Nabadwip',
          postOffice: 'Nabadwip',
          district: 'Nadia',
          state: 'West Bengal',
          pincode: '741302',
          country: 'India',
          mobile1: '9123456780',
          mobile2: '9876543210',
          email: 'gouranga@example.com',
          category: 'Trustee',
          status: 'Active',
          totalDonations: 25000,
        },
      ]);
      console.log('🌱 Seeded initial members');
    }

    // 2. Seed Collection Agents if empty
    const agentCount = await CollectionAgent.countDocuments();
    if (agentCount === 0) {
      await CollectionAgent.create([
        {
          agentCode: 'AGT-001',
          name: 'Subhasish Goswami',
          phone: '9832198765',
          assignedArea: 'Nabadwip Town & Ghats',
          totalCollected: 15500,
          pendingSettlement: 5000,
        },
        {
          agentCode: 'AGT-002',
          name: 'Bimal Krishna Das',
          phone: '9734567890',
          assignedArea: 'Mayapur & Teghori',
          totalCollected: 8200,
          pendingSettlement: 0,
        },
        {
          agentCode: 'AGT-003',
          name: 'Pranab Kumar Roy',
          phone: '9434123456',
          assignedArea: 'Krishnanagar & Shantipur',
          totalCollected: 12000,
          pendingSettlement: 3500,
        },
      ]);
      console.log('🌱 Seeded initial collection agents');
    }

    // 3. Seed Initial Donations if empty
    const donationCount = await Donation.countDocuments();
    if (donationCount === 0) {
      await Donation.create([
        {
          receiptNo: 'CKF-2026-001',
          memberId: 'CKF-M-001',
          donorName: 'Shyamasundar Das',
          mobile: '9832104512',
          email: 'shyamasundar@example.com',
          address: 'Harisabha Para, Nabadwip',
          amount: 5001,
          amountInWords: 'Five Thousand One Rupees Only',
          channel: 'Walk-in to Foundation',
          paymentMode: 'Cash',
          purpose: 'Daily Anna Daan Seva',
          collectedBy: 'Krishnendu Chakraborty',
          settlementStatus: 'Settled',
          status: 'Completed',
        },
        {
          receiptNo: 'CKF-2026-002',
          memberId: 'CKF-M-002',
          donorName: 'Anandamayee Devi',
          mobile: '9679014230',
          email: 'anandamayee@example.com',
          address: 'Bowbazar Road, Nabadwip',
          amount: 2500,
          amountInWords: 'Two Thousand Five Hundred Rupees Only',
          channel: 'Field Collection',
          paymentMode: 'Cash',
          purpose: 'Temple Renovation & Maintenance',
          collectedBy: 'Subhasish Goswami (AGT-001)',
          agentId: 'AGT-001',
          agentName: 'Subhasish Goswami',
          settlementStatus: 'Pending Office Deposit',
          status: 'Completed',
        },
        {
          receiptNo: 'CKF-2026-003',
          memberId: 'CKF-M-003',
          donorName: 'Gouranga Charan Chakraborty',
          mobile: '9123456780',
          email: 'gouranga@example.com',
          address: 'College Para, Nabadwip',
          amount: 10000,
          amountInWords: 'Ten Thousand Rupees Only',
          channel: 'Online Donation',
          paymentMode: 'UPI',
          purpose: 'Festivals & Utsavs Seva',
          collectedBy: 'Central Office Portal',
          settlementStatus: 'Settled',
          status: 'Completed',
        },
      ]);
      console.log('🌱 Seeded initial donations');
    }

    // 4. Seed Events if empty
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.create([
        {
          title: 'Sri Gaur Purnima Mahotsav',
          bengali: 'শ্রী গৌর পূর্ণিমা মহোৎসব',
          season: 'Phalguna Purnima (Feb / March)',
          time: 'All Day • Mangala to Midnight Sandhya Aarti',
          category: 'Major Utsav',
          desc: 'The sacred divine advent celebration of Lord Sri Krishna Chaitanya Mahaprabhu in sacred Nabadwip Dham. Features Maha Abhishek of Gaura-Nitai deities, 24-hour Akhanda Harinam Sankirtan, and mass distribution of sanctified Mahaprasadam.',
          seva: 'Anna Daan & Altar Flowers',
          image: '/assets/Krishna’s Golden Riverside Devotion.png',
          featured: true,
        },
        {
          title: 'Sri Krishna Janmashtami & Nandotsav',
          bengali: 'শ্রীকৃষ্ণ জন্মাষ্টমী ও নন্দোৎসব',
          season: 'Bhadra Krishna Ashtami (August / September)',
          time: 'Midnight Abhishek & Next-Day Feast',
          category: 'Major Utsav',
          desc: 'Celebrating the divine appearance of Bhagavan Sri Krishna. Day-long fasting, Srimad Bhagavatam katha, midnight aarti, and Nandotsav grand feast.',
          seva: 'Midnight Bhoga & Milk Abhishek',
          image: '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
          featured: true,
        },
        {
          title: 'Sri Radhashtami Utsav',
          bengali: 'শ্রী রাধাষ্টমী উৎসব',
          season: 'Bhadra Shukla Ashtami (September)',
          time: '12:00 PM Midday Maha Abhishek',
          category: 'Pariwar Seva',
          desc: 'Central to Sri Radha Sakti Gadadhar Pandit Pariwar. Srimati Radharani lotus feet darshan, singing of Sri Radhastakam, offerings of golden ornaments.',
          seva: 'Lotus Garlands & Scented Oils',
          image: '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
          featured: false,
        },
      ]);
      console.log('🌱 Seeded initial events');
    }

    // 5. Seed Blogs if empty
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.create([
        {
          title: 'Sri Ramsundar Vidyalankar: Academic Pioneer & Social Reformer of 19th-Century Bengal',
          bengali: 'শ্রী রামসুন্দর বিদ্যালঙ্কার ও সমাজ সংস্কার',
          category: 'Heritage & History',
          excerpt: 'A contemporary of Raja Ram Mohan Roy, Sri Ramsundar Vidyalankar established Sri Sri Chintamoni Kunja in 1809. Discover how he used Gaudiya Vaishnav philosophy to advocate for mass literacy and oppose caste discrimination.',
          content: 'Sri Ramsundar Vidyalankar, affectionately and reverently known as Sri Chintamoni Goswami by the Vaishnav assembly, stands as one of the most luminous yet humble personalities of the Bengal Renaissance...',
          author: 'Seva Research Desk',
          readTime: '7 min read',
          image: '/assets/Nabadwip Dham Temple in Sunshine.png',
          status: 'published',
        },
        {
          title: 'The Daily Practice of Mahamantra Japa: Science and Spirit of Sacred Sound',
          bengali: 'মহামন্ত্র জপ সাধনা ও দিব্য ধ্বনিবিজ্ঞান',
          category: 'Katha & Philosophy',
          excerpt: 'How meditating upon the sixteen holy names cleanses the mirror of the mind (ceto-darpana-marjanam) and restores spiritual poise amid modern stress.',
          content: 'In the Kali Santarana Upanishad, the sage Narada inquires from Lord Brahma how living entities can transcend the anxieties and turbulence of the age of conflict...',
          author: 'Sri Sri Chintamoni Kunja Ashram',
          readTime: '5 min read',
          image: '/assets/Golden Kirtan by the Sacred Ghats.png',
          status: 'published',
        },
      ]);
      console.log('🌱 Seeded initial blogs');
    }

    // 6. Seed Gallery if empty
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      await Gallery.create([
        {
          title: 'Sri Sri Radha Madan Mohan & Gaura-Nitai Altar',
          category: 'Temple & Altar',
          image: '/assets/Opulent Gaura-Nitai and Madan Mohan Altar.png',
          caption: 'Divine sanctum adorned with floral shringar during Mangala Aarti at Nabadwip Dham.',
        },
        {
          title: 'Sacred Harinam Sankirtan at Sacred Ghats',
          category: 'River Ghats & Dham',
          image: '/assets/Golden Kirtan by the Sacred Ghats.png',
          caption: 'Devotees chanting Harinam on the banks of sacred Bhagirathi Ganga.',
        },
        {
          title: 'Nabadwip Dham Mandir in Golden Sunlight',
          category: 'Temple & Altar',
          image: '/assets/Nabadwip Dham Temple in Sunshine.png',
          caption: 'Exterior heritage sanctum of Sri Sri Chintamoni Kunja established in 1809.',
        },
        {
          title: 'Devotional Procession Before Lord Jagannath',
          category: 'Festivals & Utsavs',
          image: '/assets/Devotional Procession Before Lord Jagannath.png',
          caption: 'Annual Rath Yatra procession through Bowbazar Road, Nabadwip.',
        },
      ]);
      console.log('🌱 Seeded initial gallery items');
    }
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedInitialData;
