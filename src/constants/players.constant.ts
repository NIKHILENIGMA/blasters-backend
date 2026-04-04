import { CreatePlayer } from '@/modules/players/players.types'
/** 
export const CSK_PLAYERS: CreatePlayer[] = [
    {
        name: 'Ruturaj Gaikwad',
        iplTeam: 'CSK',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'MS DHoni',
        iplTeam: 'CSK',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 80
    },
    {
        name: 'Sanju Samson',
        iplTeam: 'CSK',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 70
    },
    {
        name: 'Dewald Brevis',
        iplTeam: 'CSK',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: true,
        cost: 55
    },
    {
        name: 'Ayush Mhatre',
        iplTeam: 'CSK',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 30
    },
    {
        name: 'Kartik Sharma',
        iplTeam: 'CSK',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 25
    },
    {
        name: 'Sarfaraz Khan',
        iplTeam: 'CSK',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 40
    },
    {
        name: 'Urvil Patel',
        iplTeam: 'CSK',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 20
    },
    {
        name: 'Anshul Kamboj',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 35
    },
    {
        name: 'Jamei Overton',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 50
    },
    {
        name: 'Ramakrishna Gosh',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 25
    },
    {
        name: 'Prashant Veer',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 20
    },
    {
        name: 'Matthew William Short',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 60
    },
    {
        name: 'Aman Khan',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 30
    },
    {
        name: 'Zak Foulkes',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 45
    },
    {
        name: 'Shivam Dube',
        iplTeam: 'CSK',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 65
    },
    {
        name: 'Khaleel Ahmed',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 55
    },
    {
        name: 'Noor Ahmad',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 50
    },
    {
        name: 'Mukesh Choudhary',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 45
    },
    {
        name: 'Nathan Ellis',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 60
    },
    {
        name: 'Shreyas Gopal',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 40
    },
    {
        name: 'Gurjapneet Singh',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 20
    },
    {
        name: 'Akeal Hosein',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 55
    },
    {
        name: 'Matt Henry',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 70
    },
    {
        name: 'Rahul Chahar',
        iplTeam: 'CSK',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 50
    }
]

export const KKR_PLAYERS: CreatePlayer[] = [
    {
        name: 'Ajinkya Rahane',
        iplTeam: 'KKR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 70
    },
    {
        name: 'Rinku Singh',
        iplTeam: 'KKR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 74
    },
    {
        name: 'Angkrish Raghuvanshi',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 48
    },
    {
        name: 'Manish Pandey',
        iplTeam: 'KKR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 64
    },
    {
        name: 'Finn Allen',
        iplTeam: 'KKR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 63
    },
    {
        name: 'Tejasvi Singh',
        iplTeam: 'KKR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 42
    },
    {
        name: 'Rahul Tripathi',
        iplTeam: 'KKR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 72
    },
    {
        name: 'Tim Seifert',
        iplTeam: 'KKR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 60
    },
    {
        name: 'Rovman Powell',
        iplTeam: 'KKR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: true,
        cost: 70
    },
    {
        name: 'Anukul Roy',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 58
    },
    {
        name: 'Cameron Green',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 78
    },
    {
        name: 'Sarthak Ranjan',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 40
    },
    {
        name: 'Daksh Kamra',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 38
    },
    {
        name: 'Rachin Ravindra',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 77
    },
    {
        name: 'Ramandeep Singh',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 57
    },
    {
        name: 'Sunil Narine',
        iplTeam: 'KKR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 80
    },
    {
        name: 'Blessing Muzarabani',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 62
    },
    {
        name: 'Vaibhav Arora',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 55
    },
    {
        name: 'Matheesha Pathirana',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 73
    },
    {
        name: 'Kartik Tyagi',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 59
    },
    {
        name: 'Prashant Solanki',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 54
    },
    {
        name: 'Saurabh Dubey',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 35
    },
    {
        name: 'Navdeep Saini',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 56
    },
    {
        name: 'Umran Malik',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 71
    },
    {
        name: 'Varun Chakravarthy',
        iplTeam: 'KKR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 76
    }
]

export const MI_PLAYERS: CreatePlayer[] = [
    {
        name: 'Rohit Sharma',
        iplTeam: 'MI',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 76
    },
    {
        name: 'Suryakumar Yadav',
        iplTeam: 'MI',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 80
    },
    {
        name: 'Robin Minz',
        iplTeam: 'MI',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 45
    },
    {
        name: 'Shefrane Rutherford',
        iplTeam: 'MI',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: true,
        cost: 66
    },
    {
        name: 'Ryan Rickelton',
        iplTeam: 'MI',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 65
    },
    {
        name: 'Quinton De Kock',
        iplTeam: 'MI',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 78
    },
    {
        name: 'Danish Malewar',
        iplTeam: 'MI',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 40
    },
    {
        name: 'N. Tilak Varma',
        iplTeam: 'MI',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 74
    },
    {
        name: 'Naman Dhir',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 55
    },
    {
        name: 'Mitchell Santner',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 73
    },
    {
        name: 'Raj Angad Bawa',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 52
    },
    {
        name: 'Atharva Ankolekar',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 50
    },
    {
        name: 'Mayank Rawat',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 38
    },
    {
        name: 'Corbin Bosch',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 58
    },
    {
        name: 'Will Jacks',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Shardul Thakur',
        iplTeam: 'MI',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 70
    },
    {
        name: 'Trent Boult',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 77
    },
    {
        name: 'Mayank Markande',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 60
    },
    {
        name: 'Deepak Chahar',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 72
    },
    {
        name: 'Ashwani Kumar',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 35
    },
    {
        name: 'Raghu Sharma',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 34
    },
    {
        name: 'Mohammad Izhar',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 36
    },
    {
        name: 'Allah Ghazanfar',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 62
    },
    {
        name: 'Jasprit Bumrah',
        iplTeam: 'MI',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 80
    }
]

export const RCB_PLAYERS: CreatePlayer[] = [
    {
        name: 'Rajat Patidar',
        iplTeam: 'RCB',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Devdutt Padikkal',
        iplTeam: 'RCB',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Virat Kohli',
        iplTeam: 'RCB',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Phill Salt',
        iplTeam: 'RCB',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Jitesh Sharma',
        iplTeam: 'RCB',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Jordan Cox',
        iplTeam: 'RCB',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Krunal Pandya',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Swapnil Singh',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Tim David',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Romario Shepherd',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Jacob Bethell',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Venkatesh Iyer',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Satvik Deswal',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Mangesh Yadav',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Vicky Ostwal',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Vihaan Malhotra',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Kanishk Chouhan',
        iplTeam: 'RCB',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Josh Hazlewood',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Rasikh Dar',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Suyash Sharma',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Bhuvneshwar Kumar',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Nuwan Thushara',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Abhinandan Singh',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Jacob Duffy',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Yash Dayal',
        iplTeam: 'RCB',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    }
]

export const SRH_PLAYERS: CreatePlayer[] = [
    {
        name: "Ishan Kishan",
        iplTeam: "SRH",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Aniket Verma",
        iplTeam: "SRH",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "SMaran Ravichandran",
        iplTeam: "SRH",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Salil Arora",
        iplTeam: "SRH",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Heinrich Klaasen",
        iplTeam: "SRH",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Travis Head",
        iplTeam: "SRH",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Harshal Patel",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Kamindu Mendis",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Harsh Dubey",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Brydon Carse",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Shivang Kumar",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Krains Fuletra",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Liam Livingstone",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "David Payne",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Abhishek Sharma",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Nitish Kumar Reddy",
        iplTeam: "SRH",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Pat Cummins",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Zeeshan Ansari",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Jaydev Unadkat",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Eshan Malinga",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Sakib Hussain",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Onkar Tarmale",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Amit Kumar",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Praful Hinge",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Shivam Mavi",
        iplTeam: "SRH",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
]


export const DC_PLAYERS: CreatePlayer[] = [
    {
        name: "KL Rahul",
        iplTeam: "DC",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Karun Nair",
        iplTeam: "DC",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "David Miller",
        iplTeam: "DC",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Ben Duckett",
        iplTeam: "DC",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Pathum Nlkssanka",
        iplTeam: "DC",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Sahil Parakh",
        iplTeam: "DC",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Prithvi Shaw",
        iplTeam: "DC",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Abishek Porel",
        iplTeam: "DC",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Tristan Stubbs",
        iplTeam: "DC",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Axar Patel",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Sameer Rizvi",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Ashutosh Sharma",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Vipraj Nigam",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Ajay Mandal",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Tripura Vijay",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Madhav Tiwari",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Auqib Dar",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Nitish Rana",
        iplTeam: "DC",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Mitchell Starc",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "T.Natarajan",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Mukesh Kumar",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Dushmantha Chameera",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Lungisani Ngidi",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Kyle Jamieson",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Kuldeep Yadav",
        iplTeam: "DC",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
]


export const PBKS_PLAYERS: CreatePlayer[] = [
    {
        name: "Shreyas Iyer",
        iplTeam: "PBKS",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Nehal Wadhera",
        iplTeam: "PBKS",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Vishnu Vinod",
        iplTeam: "PBKS",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Harnoor Pannu",
        iplTeam: "PBKS",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Pyla Avinash",
        iplTeam: "PBKS",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Prabhsimran Singh",
        iplTeam: "PBKS",
        role: "Wicket-Keeper",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Shashank Singh",
        iplTeam: "PBKS",
        role: "Batsman",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Marcus Stoinis",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Harpreet Brar",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Marco Jansen",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Azmatullah Omarzai",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Priyanshu Arya",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Musheer Khan",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Suryansh Shedge",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Mitch Owen",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Cooper Connolly",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Ben Dwarshuis",
        iplTeam: "PBKS",
        role: "All-Rounder",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Arshdeep Singh",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Yuzvendra Chahal",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Vyshak Vijay Kumar",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Yash Thakur",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Zavier Bartlett",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
    {
        name: "Pravin Dubey",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Vishal Nishad",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: false,
        cost: 75,
    },
    {
        name: "Lockie Ferguson",
        iplTeam: "PBKS",
        role: "Bowler",
        profileImageUrl: "",
        isOverseas: true,
        cost: 75,
    },
]
*/
export const RR_PLAYERS: CreatePlayer[] = [
    {
        name: 'Shivam Dubey',
        iplTeam: 'RR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Vaibhav Suryawanshi',
        iplTeam: 'RR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Donovan Ferreira',
        iplTeam: 'RR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Lhuan-Dre pretorious',
        iplTeam: 'RR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Ravi Singh',
        iplTeam: 'RR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Aman Rao Perala',
        iplTeam: 'RR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Shimron Hetmyer',
        iplTeam: 'RR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Yashasvi Jaiswal',
        iplTeam: 'RR',
        role: 'Batsman',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Dhruv Jurel',
        iplTeam: 'RR',
        role: 'Wicket-Keeper',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Riyan Parag',
        iplTeam: 'RR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Yudhvir Singh  Charak',
        iplTeam: 'RR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Ravindra Jadeja',
        iplTeam: 'RR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Dasun Shanaka',
        iplTeam: 'RR',
        role: 'All-Rounder',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Jofra Archer',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Tushar Deshpande',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Kwena Maphaka',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Ravi Bishnoi',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Sushant Mishra',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Yash Raj Punja',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Vignesh Puthur',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Brijesh Sharma',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Adam Milne',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: true,
        cost: 75
    },
    {
        name: 'Kuldeep Sen',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Sandeep Sharma',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    },
    {
        name: 'Nandre Burger',
        iplTeam: 'RR',
        role: 'Bowler',
        profileImageUrl: '',
        isOverseas: false,
        cost: 75
    }
]
