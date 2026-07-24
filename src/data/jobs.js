// Deterministic mock job-market data generator.
// Produces 1000+ realistic-looking listings for demo purposes.

const companies = [
  "Nimbus Systems","Aurora Analytics","Vertex Cloud","BluePeak Technologies","Northstar Digital",
  "Cobalt Robotics","Lumen Softworks","Pinnacle Data Labs","Halcyon AI","Ridgeline Networks",
  "Solstice Fintech","Ember Interactive","Quartz Health Tech","Cascade Logistics","Ironwood Security",
  "Meridian Commerce","Silverline Studios","Vantage Point Media","Crescent Bio Informatics","Torque Mobility",
  "Granite Cloudworks","Wavefront Semiconductors","Basalt Retail Tech","Kestrel Aerospace Software","Amberline Insurance Tech",
  "Driftwood Gaming","Onyx Payments","Beacon Edtech","Fernwood Agritech","Copperline Manufacturing Systems",
  "Tidewater Maritime Tech","Redshift Labs","Palisade Cyber","Marrow Health Systems","Thistle & Co Consulting",
  "Skyline Freight Tech","Harborlight Bank","Prairie Grain Analytics","Foxglove Design Co","Slate & Pine Software"
];

const roles = [
  { title: "Frontend Developer", skills: ["React","JavaScript","CSS","HTML","TypeScript"] },
  { title: "Backend Developer", skills: ["Java","Spring Boot","REST APIs","SQL","Microservices"] },
  { title: "Full Stack Developer", skills: ["React","Java","Spring Boot","MySQL","JavaScript"] },
  { title: "Data Analyst", skills: ["SQL","Excel","Python","Power BI","Statistics"] },
  { title: "Data Scientist", skills: ["Python","Machine Learning","Pandas","Statistics","SQL"] },
  { title: "Machine Learning Engineer", skills: ["Python","TensorFlow","PyTorch","MLOps","Machine Learning"] },
  { title: "DevOps Engineer", skills: ["Docker","Kubernetes","CI/CD","AWS","Linux"] },
  { title: "Cloud Engineer", skills: ["AWS","Azure","Terraform","Networking","Linux"] },
  { title: "QA Engineer", skills: ["Selenium","Test Automation","Java","JIRA","Manual Testing"] },
  { title: "Mobile App Developer", skills: ["React Native","Kotlin","Swift","Java","REST APIs"] },
  { title: "UI/UX Designer", skills: ["Figma","Wireframing","User Research","Prototyping","CSS"] },
  { title: "Product Manager", skills: ["Roadmapping","Agile","Stakeholder Management","SQL","Analytics"] },
  { title: "Business Analyst", skills: ["SQL","Excel","Requirements Gathering","Power BI","Communication"] },
  { title: "Java Developer", skills: ["Java","Spring Boot","Hibernate","MySQL","REST APIs"] },
  { title: "Python Developer", skills: ["Python","Django","Flask","SQL","REST APIs"] },
  { title: "Cybersecurity Analyst", skills: ["Network Security","SIEM","Python","Risk Assessment","Linux"] },
  { title: "Database Administrator", skills: ["SQL","MySQL","PostgreSQL","Backup & Recovery","Performance Tuning"] },
  { title: "AI Engineer", skills: ["Python","LangChain","LLMs","Vector Databases","Machine Learning"] },
  { title: "Systems Administrator", skills: ["Linux","Windows Server","Networking","Bash","Active Directory"] },
  { title: "Technical Support Engineer", skills: ["Troubleshooting","SQL","Customer Communication","Linux","Networking"] },
];

const cities = [
  "Pune","Bengaluru","Hyderabad","Mumbai","Chennai","Delhi NCR","Ahmedabad","Kolkata","Nagpur","Kochi",
  "Remote (India)","Remote (Global)","Indore","Jaipur","Chandigarh"
];

const types = ["Full-time","Internship","Contract","Part-time"];
const modes = ["On-site","Remote","Hybrid"];
const levels = ["Entry Level","Associate","Mid Level","Senior"];

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildJobs(count = 1240) {
  const rand = seededRandom(42);
  const jobs = [];
  for (let i = 0; i < count; i++) {
    const role = roles[Math.floor(rand() * roles.length)];
    const company = companies[Math.floor(rand() * companies.length)];
    const city = cities[Math.floor(rand() * cities.length)];
    const type = types[Math.floor(rand() * types.length)];
    const mode = city.startsWith("Remote") ? "Remote" : modes[Math.floor(rand() * modes.length)];
    const level = levels[Math.floor(rand() * levels.length)];
    const baseSalary = 3 + Math.floor(rand() * 22); // LPA
    const daysAgo = Math.floor(rand() * 30);
    const skillCount = 3 + Math.floor(rand() * 2);
    const skills = [...role.skills].sort(() => rand() - 0.5).slice(0, skillCount);

    jobs.push({
      id: `CF-${1000 + i}`,
      title: role.title,
      company,
      city,
      type,
      mode,
      level,
      salaryLPA: `${baseSalary}-${baseSalary + 4} LPA`,
      postedDaysAgo: daysAgo,
      skills,
      description:
        `${company} is looking for a ${level.toLowerCase()} ${role.title} to join our ${mode.toLowerCase()} team in ${city}. ` +
        `You'll work across the stack on real product features, collaborate with cross-functional teams, and ship improvements that reach live users. ` +
        `We value curiosity, ownership, and clear communication as much as raw technical skill.`,
      requirements: skills,
    });
  }
  return jobs;
}

export const ALL_JOBS = buildJobs();

export const ALL_SKILLS = Array.from(
  new Set(roles.flatMap((r) => r.skills))
).sort();

export function matchScore(userSkills, jobSkills) {
  if (!userSkills || userSkills.length === 0) return 0;
  const set = new Set(userSkills.map((s) => s.toLowerCase()));
  const overlap = jobSkills.filter((s) => set.has(s.toLowerCase())).length;
  return Math.round((overlap / jobSkills.length) * 100);
}
