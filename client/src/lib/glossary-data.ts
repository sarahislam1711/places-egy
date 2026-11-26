export type GlossaryTerm = {
  term: string;
  definition: string;
  category: string; // First letter
  // Optional page on the site that explains the term in full.
  link?: { href: string; label: string };
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: "Admin Office", definition: "A workspace designed for administrative and managerial tasks, typically located in business districts.", category: "A" },
  { term: "Amenities", definition: "Features or facilities provided in a building or complex, such as parking, gyms, or meeting rooms.", category: "A" },
  { term: "Anchor Tenant", definition: "A major tenant, often a well-known brand, that attracts other tenants and customers to a commercial property.", category: "A" },
  
  { term: "Broker", definition: "A licensed professional who represents buyers or sellers in real estate transactions.", category: "B" },
  { term: "Business Park", definition: "An area of land in which many office buildings are grouped together.", category: "B" },
  { term: "Built-up Area (BUA)", definition: "The total floor area of a building, including all floors and external walls.", category: "B" },

  { term: "Capital Appreciation", definition: "The increase in the value of an asset or investment over time.", category: "C" },
  { term: "Commercial Real Estate", definition: "Property used exclusively for business-related purposes or to provide a workspace rather than a living space.", category: "C" },
  { term: "Common Area Maintenance (CAM)", definition: "Fees paid by tenants to cover the cost of maintaining shared areas like hallways, elevators, and parking lots.", category: "C" },
  { term: "Core & Shell", definition: "A property delivery condition where the base structure and exterior are finished, but the interior is left bare for the tenant to customize.", category: "C" },

  { term: "Developer", definition: "A person or company that builds and creates new real estate projects.", category: "D" },
  { term: "Down Payment", definition: "An initial up-front partial payment for the purchase of property.", category: "D" },
  { term: "Due Diligence", definition: "The process of verifying the financial, legal, and physical condition of a property before purchase.", category: "D" },

  { term: "Equity", definition: "The difference between the market value of a property and the amount owed on the mortgage.", category: "E" },
  { term: "Escrow", definition: "A legal arrangement in which a third party temporarily holds money or property until a particular condition has been met.", category: "E" },

  { term: "Facility Management", definition: "The maintenance and upkeep of a commercial property to ensure functionality and safety.", category: "F" },
  { term: "Fit-out", definition: "The process of making an interior space suitable for occupation.", category: "F" },
  { term: "Freehold", definition: "Absolute ownership of real property.", category: "F" },
  { term: "Fully Finished", definition: "A unit that is completely finished with flooring, painting, and sometimes appliances, ready for immediate move-in.", category: "F" },

  { term: "Gross Leasable Area (GLA)", definition: "The total floor area designed for the exclusive use of tenants, including basements and mezzanines.", category: "G" },
  
  { term: "HVAC", definition: "Heating, Ventilation, and Air Conditioning systems used in buildings.", category: "H" },
  { term: "High Street", definition: "The primary business street in a town or city, often referring to premium retail locations.", category: "H" },

  { term: "Investment Grade", definition: "Properties or investments that are considered to have a relatively low risk of default.", category: "I" },

  { term: "Joint Venture", definition: "A business arrangement where two or more parties agree to pool their resources for a specific task or project.", category: "J" },

  { term: "Landlord", definition: "The owner of a property who rents or leases it to another party.", category: "L" },
  { term: "Lease Agreement", definition: "A contract outlining the terms under which one party agrees to rent property owned by another party.", category: "L" },
  { term: "Letter of Intent (LOI)", definition: "A document outlining the general plans of an agreement between two or more parties before a legal agreement is finalized.", category: "L" },

  { term: "Maintenance Fee", definition: "A periodic charge paid by condo or office owners for the upkeep of the property.", category: "M" },
  { term: "Mixed-Use Development", definition: "A project that blends residential, commercial, cultural, institutional, or entertainment uses.", category: "M" },

  { term: "Net Operating Income (NOI)", definition: "A calculation used to analyze the profitability of income-generating real estate investments.", category: "N" },

  { term: "Occupancy Rate", definition: "The percentage of all rental units or space that is occupied or rented at a given time.", category: "O" },
  { term: "Off-Plan", definition: "Purchasing a property before it has been built.", category: "O" },

  { term: "Prime Location", definition: "A highly desirable location for real estate, often commanding higher prices.", category: "P" },
  { term: "Property Management", definition: "The daily oversight of residential, commercial, or industrial real estate by a third-party contractor.", category: "P" },

  { term: "Real Estate Investment Trust (REIT)", definition: "A company that owns, operates, or finances income-generating real estate.", category: "R" },
  { term: "Resale", definition: "The act of selling a property that has been previously owned.", category: "R" },
  { term: "ROI (Return on Investment)", definition: "A performance measure used to evaluate the efficiency or profitability of an investment.", category: "R" },

  { term: "Security Deposit", definition: "A sum of money held in trust either as an initial part-payment or as security for the landlord.", category: "S" },
  { term: "Serviced Office", definition: "An office that is fully equipped and managed by a facility management company.", category: "S" },
  { term: "Square Meter Price", definition: "The cost per square meter of a property, a standard metric in Egyptian real estate.", category: "S" },

  { term: "Tenant", definition: "A person or group that rents and occupies land, a house, an office, or the like.", category: "T" },
  { term: "Tenant Representation", definition: "A service where a real estate advisor works only for the company renting an office, not the landlord: defining the brief, searching the market, negotiating the lease and reviewing the contract. Also called tenant rep or tenant advisory. With PLACES it is free for tenants, as the landlord pays the fee.", category: "T", link: { href: "/services/tenant-representation", label: "Our tenant representation service" } },
  { term: "Turnkey", definition: "A property that is fully ready for occupation or use.", category: "T" },

  { term: "Utilities", definition: "Services provided by public utility companies, such as electricity, natural gas, and water.", category: "U" },

  { term: "Vacancy Rate", definition: "The percentage of all available units in a rental property that are vacant or unoccupied.", category: "V" },
  { term: "Valuation", definition: "The process of determining the current worth of an asset or company.", category: "V" },

  { term: "Yield", definition: "The income return on an investment, usually expressed as an annual percentage.", category: "Y" },
  
  { term: "Zoning", definition: "Municipal or local laws or regulations that govern how real property can and cannot be used in certain geographic areas.", category: "Z" },
];
