const Member = require('../models/Member');
const Donation = require('../models/Donation');
const CollectionAgent = require('../models/CollectionAgent');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');
const User = require('../models/User');

const seedInitialData = async () => {
  try {
    // 0. Seed Default Admin if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@chintamonikunja.org').toLowerCase().trim();
      const adminPassword = process.env.ADMIN_PASSWORD || 'Chintamoni@2026';
      const adminName = process.env.ADMIN_NAME || 'Sri Chintamoni Kunja Admin';

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`🌱 Seeded default administrator (${adminEmail}) from backend .env`);
    }

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

    // 5. Seed / Sync Blogs with Full Spiritual & Historical Content
    const fullBlogs = [
      {
        title: 'Sri Ramsundar Vidyalankar: Academic Pioneer & Social Reformer of 19th-Century Bengal',
        bengali: 'শ্রী রামসুন্দর বিদ্যালঙ্কার ও সমাজ সংস্কার',
        category: 'Heritage & History',
        excerpt: 'A contemporary of Raja Ram Mohan Roy, Sri Ramsundar Vidyalankar established Sri Sri Chintamoni Kunja in 1809. Discover how he used Gaudiya Vaishnav philosophy to advocate for mass literacy and oppose medieval caste discrimination.',
        content: `Sri Ramsundar Vidyalankar, affectionately and reverently known as Sri Chintamoni Goswami by the Vaishnav assembly, stands as one of the most luminous yet humble personalities of the Bengal Renaissance. While Raja Ram Mohan Roy worked through institutional and socio-legal frameworks in Calcutta, Vidyalankar focused on grassroots transformation in the holy town of Nabadwip Dham.

In 1809, he established Sri Sri Chintamoni Kunja as an academic and spiritual center. Believing firmly that Lord Sri Krishna Chaitanya Dev was the greatest social reformer of his era, Vidyalankar preached that true devotion cannot coexist with untouchability, racism, or caste prejudice.

He opened the doors of scriptural learning to students from all social backgrounds, initiating educational drives that continue today through our Foundation's Academic Help initiative, which has supported over 2,000 students.`,
        author: 'Seva Research Desk',
        readTime: '7 min read',
        image: '/assets/Nabadwip Dham Temple in Sunshine.png',
        status: 'published',
      },
      {
        title: 'The Mystery of Sri Radha Sakti & Gadadhar Pandit: The Pinnacle of Radha-Dasyam',
        bengali: 'শ্রী রাধা শক্তি ও গদাধর পণ্ডিত প্রভুর তত্ত্ব',
        category: 'Vaishnav Philosophy',
        excerpt: 'In the Madhva Gaudiya Sampradaya, Sri Gadadhar Pandit Prabhu is revered as the internal hladini potency (Sri Radha Sakti) of the Supreme Lord. An insightful dive into the mood of unconditional devotional servitude.',
        content: `Among the Pancha Tattva, Lord Sri Gadadhar Pandit Prabhu holds an esoteric, intimate position. Classical Gaudiya texts describe him as the avatar of Srimati Radharani's transcendental devotional mood and internal pleasure potency (hladini-shakti).

In sacred Nabadwip Dham, Mahaprabhu and Gadadhar Pandit demonstrated the inseparable harmony of divine love. The Sri Radha Sakti Gadadhar Pandit Pariwar maintains this unbroken mood of 'Radha-dasyam'—the humble desire to serve the divine pleasure of Srimati Radharani and Sri Krishna through sincere Harinam Sankirtan and self-effacing compassion for all living beings.`,
        author: 'Acharya Pariwar Desk',
        readTime: '9 min read',
        image: '/assets/Radha and Krishna by the Riverside.png',
        status: 'published',
      },
      {
        title: 'Beyond Caste & Feudal Mindset: How Lord Chaitanya’s Shikshastakam Redefined Humanity',
        bengali: 'শিক্ষ অষ্টকম ও সার্বজনীন সাম্য',
        category: 'Social Reform',
        excerpt: 'Tṛṇād api sunīcena taror api sahiṣṇunā—unpacking how Lord Chaitanya\'s eight verses dismantled centuries of feudal orthodoxy and restored spiritual equality to every soul regardless of birth.',
        content: `Lord Sri Krishna Chaitanya Mahaprabhu left behind eight verses of sublime spiritual instruction known as the Shikshastakam. These verses are not mere poetic devotion; they form the manifesto of a spiritual revolution.

The third verse instructs one to become humbler than a blade of grass, more tolerant than a tree, and ready to offer all respect to others without expecting prestige. In an era marked by rigid caste hierarchies, Mahaprabhu embraced Haridas Thakur, appointed Ramananda Raya as an exalted teacher, and declared that anyone who knows the science of Krishna is a bona fide spiritual guide.

At Sri Sri Chintamoni Kunja, we guard this egalitarian mandate fiercely, rejecting medieval feudal prejudice and maintaining unconditional service for every pilgrim.`,
        author: 'Spiritual Council',
        readTime: '6 min read',
        image: '/assets/Golden Kirtan by the Sacred Ghats.png',
        status: 'published',
      },
      {
        title: 'Zero Starvation as Divine Seva: The Sacred Science of Anna Daan in Nabadwip Dham',
        bengali: 'ক্ষুধামুক্ত সমাজের ব্রত ও প্রসাদ সেবা',
        category: 'Humanitarian Seva',
        excerpt: 'Why sanctified food distribution (prasadam) is considered the highest form of compassion in Vedic culture, and how our Zero Starvation Movement feeds pilgrims daily without distinction.',
        content: `In Vaishnav tradition, food is not merely caloric fuel; it is prasad—the sanctified mercy of the Divine. By offering nutritious, vegetarian foodstuffs prepared with devotion to Lord Madan Mohan and distributing them freely, we nourish both body and spirit.

During pandemics, floods, and natural calamities, Sri Sri Chintamoni Kunja has distributed over one lakh meals across Nadia district. Today, our Zero Starvation Movement continues daily, ensuring that no visitor, student, or pilgrim leaves Nabadwip Dham with an empty stomach.`,
        author: 'Foundation Seva Desk',
        readTime: '5 min read',
        image: '/assets/Devotional Procession Before Lord Jagannath.png',
        status: 'published',
      },
      {
        title: 'The Art of Sattvic Living: Ancient Dinacharya for Modern Peace of Mind',
        bengali: 'সাত্ত্বিক জীবনধারা ও মানসিক প্রশান্তি',
        category: 'Art of Living',
        excerpt: 'Harmonizing daily routines, dietary discipline, mindful breathing, and personal mantra meditation to cultivate emotional equanimity in a fast-paced world.',
        content: `Modern life is inundated with cognitive overload, sensory distraction, and chronic stress. The Vaishnav science of 'Dinacharya' (daily sacred rhythm) provides a timeless sanctuary for mental balance.

Beginning with early morning reflection (Brahma Muhurta), cultivating mindful breathing during mantra japa, partaking of wholesome sattvic nutrition, and dedicating at least one action every day to selfless service (seva) creates psychological resilience and inner stillness.`,
        author: 'Dr. K. Chakraborty',
        readTime: '8 min read',
        image: '/assets/Krishna’s Golden Riverside Devotion.png',
        status: 'published',
      },
      {
        title: 'The Daily Practice of Mahamantra Japa: Science and Spirit of Sacred Sound',
        bengali: 'মহামন্ত্র জপ সাধনা ও দিব্য ধ্বনিবিজ্ঞান',
        category: 'Katha & Philosophy',
        excerpt: 'How meditating upon the sixteen holy names cleanses the mirror of the mind (ceto-darpana-marjanam) and restores spiritual poise amid modern stress.',
        content: `In the Kali Santarana Upanishad, the sage Narada inquires from Lord Brahma how living entities can transcend the anxieties and turbulence of the age of conflict. Lord Brahma instructs him to constantly chant the sixteen holy names: Hare Krishna, Hare Krishna, Krishna Krishna, Hare Hare / Hare Rama, Hare Rama, Rama Rama, Hare Hare.

Sound is the subtle blueprint of consciousness. When divine vibration permeates neuro-cognitive pathways, it dislodges deeply embedded impressions of anxiety, ego, and despair. At Chintamoni Kunja, daily communal and private Japa creates an atmosphere of spiritual serenity, bringing inner peace to thousands of practitioners.`,
        author: 'Sri Sri Chintamoni Kunja Ashram',
        readTime: '5 min read',
        image: '/assets/Golden Kirtan by the Sacred Ghats.png',
        status: 'published',
      },
    ];

    for (const b of fullBlogs) {
      await Blog.findOneAndUpdate(
        { title: b.title },
        { $set: b },
        { upsert: true, new: true }
      );
    }
    console.log(`🌱 Seeded & verified ${fullBlogs.length} complete articles in MongoDB`);

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

