//report-list.ts
export const envConfig: any = {
  dev: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: 'dece37f1-1802-4c96-a012-8550f2fc7ee3',
        name: 'Fleet Safety',
        description: 'Overview of safety scores for fleets based on driving behaviors.',
        exportReports: [
          {
            reportId: '714daef2-f14f-4de5-9367-dd17debf2191',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'f0e2e976-3ba5-4fc1-bac5-530eb6de6882',
        name: 'Multi Role Test',
        description: 'For Testing purposes',
        exportReports: [
          {
            reportId: 'f0e2e976-3ba5-4fc1-bac5-530eb6de6882',
            datasetId: '025af6e8-5a3b-4beb-b8bc-f9dc5c8a0aaf',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'c1038d6b-8cab-44ce-b4d4-a37f0c444d7d',
        name: 'Event Hotspots',
        description: 'Locations where incidents occur frequently for insured fleets.',
        exportReports: [
          {
            reportId: '26bcb35d-9fa9-4a02-bc8d-e2a955254588',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: '20233997-aa99-45fc-a008-e76f81bd98d8',
        name: 'Vehicles without Devices',
        description: 'List of insured vehicles without active telematics devices.',
        exportReports: [
          {
            reportId: '473f498a-cc30-4af5-b674-c2cc4b515a13',
            datasetId: '937d9162-728a-4bdd-b256-ccfad2b7edcb',
            isPaginated: true,
          },
        ],
      },
      {
        id: '1b026d39-d83a-4987-9e19-33f2790a352a',
        name: 'Vehicle Risk',
        description: 'Vehicle-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: '1c088eec-005d-4ac1-9a7b-2f714da64c14',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: '85cb245e-1973-4767-911e-e0385196847d',
        name: 'Vehicle Details',
        description: 'List of insured vehicles in each Fleet + Vehicle details.',
        exportReports: [
          {
            reportId: 'fc6a9be3-abd9-41c6-a831-636782ac3b29',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
          {
            reportId: 'a4513b58-3ca7-4124-9a09-68f1e1c75b8c',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'f2a5f566-bfa8-4aa3-bcb2-9a20af18fb79',
        name: 'Driver Risk',
        description: 'Driver-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: '768051e2-fd25-45e6-bfd0-2bc5519d4af3',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'dee7037b-09aa-42de-abfd-762cf08f398e',
        name: 'Driver Details',
        description: 'List of drivers in each Fleet + driver details.',
        exportReports: [
          {
            reportId: 'ca51d35f-ec75-42ab-b1d5-2528cdc1a52d',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
          {
            reportId: '64ec326b-7790-4629-aac5-f1784c8b4ad6',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: '2da9f97f-18fa-47c6-b06b-b1cd481d58e5',
        name: 'High-Risk Trips',
        description: 'Trips involving unsafe behaviors or conditions(based on trip score)',
        exportReports: [
          {
            reportId: '2f198118-b834-45cc-bda9-a619e5a08c3b',
            datasetId: 'a16b9a4b-2360-4540-a14b-b8b2406d66a7',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'a0dfe559-175d-4fc2-bd1f-97b5c8939f9c',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: 'f82047c9-1806-4afb-923e-96c879ebb85b',
            datasetId: '05eca285-e149-4ba4-9470-99f54122f5b4',
            isPaginated: true,
          },
        ],
      },
      {
        id: '6d53cac4-3175-4f7f-8c44-71fe42c72f92',
        name: 'Event Details',
        description: 'List of Events in each Fleet+ event details.',
        exportReports: [
          {
            reportId: '50378e62-4da3-4091-a57e-dc002091f8f4',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: '9a62f29a-7e2b-4cb5-b153-ad638f578d3c',
        name: 'Fleet Miles',
        description: 'List of Fleets with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: 'df84cb26-21fe-4429-b0ae-e71cc6714d6c',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'dc9376a8-d94b-443b-8179-f1ca6dd54cbd',
        name: 'Vehicle Miles',
        description: 'List of Vehicles with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '9040b0b7-6aed-4190-942c-021b9344760f',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'd98ce3f5-604e-479a-85fe-a58ee2967c9c',
        name: 'Driver Miles',
        description: 'List of Drivers with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: 'b0da715c-d55b-44e5-907e-b1c22fcba4fa',
            datasetId: '5e4b6f10-788f-4928-aeb7-e3e736264fc2',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'a61256e5-ae0c-440c-9d8f-f16a8e561d3f',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: 'cb8cfd35-6922-445d-8123-bef7b4c311b4',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
      {
        id: '6ac04f04-a52b-4b3e-a075-a41b9bf80d59',
        name: 'First-Notice-of-Loss (FNOL)',
        description: 'Ability to view Report of SI/Impact Events in a table view',
        exportReports: [
          {
            reportId: '907387c7-02be-40b5-99fa-ad10f0ff606e',
            datasetId: 'c9482b7e-f5d8-485e-bcbd-a7aa6e160f0e',
            isPaginated: true,
          },
        ],
      },
      {
        id: '418d684f-69d0-4fdb-8e8a-29ffe0ce038e',
        name: 'Fleet Vehicle Device Count',
        description: 'Every fleet with no. of vehicles and number of devices',
        exportReports: [
          {
            reportId: 'cd7f3f8b-2102-4320-a50f-aa61f104c35a',
            datasetId: '89f5b8cf-2429-4769-9163-39aa29ec23ec',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  qa: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: '4dd0252f-ccf8-49bd-9149-7ae8fd199abc',
        name: 'Vehicles without Devices',
        description: 'List of insured vehicles without active telematics devices.',
        exportReports: [
          {
            reportId: '26eb3895-8d59-4ac3-a9a5-1616f1fbaaeb',
            datasetId: '47f7164b-e60a-45af-8d5a-e30976b6ecbd',
            isPaginated: true,
          },
        ],
      },
      {
        id: '05916de4-5f21-4113-82cf-aca8ed8c9579',
        name: 'Fleet Safety',
        description: 'Overview of safety scores for fleets based on driving behaviors.',
        exportReports: [
          {
            reportId: 'c491aaa3-be52-45be-ac24-1f7b017453de',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'd4ddec5a-87d6-4b9e-8f7b-ff36a8b1ca9f',
        name: 'Event Hotspots',
        description: 'Locations where incidents occur frequently for insured fleets.',
        exportReports: [
          {
            reportId: '33debf1d-1c6d-4e3b-b659-1152b6d28a40',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '8cc3e757-b791-4c7f-a3f3-259cf1fd4aa7',
        name: 'Event Details',
        description: 'List of Events in each Fleet + event details.',
        exportReports: [
          {
            reportId: '14a3e8f6-1cf8-4d47-bd6f-48ad2a8e9b67',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '786c59be-46ec-4633-b0ff-0bc50cf2a955',
        name: 'Vehicle Risk',
        description: 'Vehicle-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: '552c10f2-dab2-4099-bcfc-1c5ec9de0841',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '7c4be160-d6a5-4869-a3df-601773ce4935',
        name: 'Vehicle Details',
        description: 'List of insured vehicles in each Fleet + Vehicle details.',
        exportReports: [
          {
            reportId: 'e92a431d-db20-4bed-afd1-f557543d4ead',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
          {
            reportId: '35df0cf3-738a-4658-b279-38981a121c27',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '7b514d48-0aab-4e18-9e24-d0a078bdc7a5',
        name: 'Driver Details',
        description: 'List of drivers in each Fleet + driver details.',
        exportReports: [
          {
            reportId: 'dd0cb162-7e1f-45c7-8cdd-263a1725e0ff',
            datasetId: 'b045a0fe-615c-4a67-bb32-6be2e2c8b7c7',
            isPaginated: true,
          },
          {
            reportId: 'bcab0083-17cb-45e8-8405-362035fd95b5',
            datasetId: 'b045a0fe-615c-4a67-bb32-6be2e2c8b7c7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '17b5fba9-abd5-4826-bec1-046ea6cc6955',
        name: 'Fleet Miles',
        description: 'List of Fleets with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '89901702-6cbe-4ea2-8234-9b83079d8489',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '296bef2d-740c-4fdd-871d-ada6e33862c2',
        name: 'Vehicle Miles',
        description: 'List of Vehicles with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '2078df9b-64d4-4096-b593-035edcd338f3',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '02da625a-51f2-4ab1-b59d-c1f9744fa7e2',
        name: 'Driver Miles',
        description: 'List of Drivers with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '6a37af3e-5cf9-4ede-bd73-c0342a472e63',
            datasetId: 'b045a0fe-615c-4a67-bb32-6be2e2c8b7c7',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'cc47dcdb-6a29-4968-aba8-c254e501521d',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '6febaee6-c679-4618-a8cd-51e8dd218056',
            datasetId: '0d089274-7a79-47a6-b731-4640a409c8d8',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'c42b6a53-8ba4-4d37-962e-986ed6331174',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: 'e352290e-43b6-452f-bcb6-a342d74f975f',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'e8b68e04-d850-4223-82e6-966d6e3221ae',
        name: 'High-Risk Trips',
        description: 'Trips involving unsafe behaviors or conditions(based on trip score)',
        exportReports: [
          {
            reportId: 'fd821881-88d9-4cbb-b18b-74370e5622e6',
            datasetId: 'f703b982-6a2e-41aa-886a-4876e2853f7f',
            isPaginated: true,
          },
        ],
      },
      {
        id: '9d5fe3c8-fc57-4f67-95a9-b0decc804c55',
        name: 'Driver Risk',
        description: 'Driver-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: 'eba41df1-76c0-4c32-a687-a534f73b105f',
            datasetId: 'b045a0fe-615c-4a67-bb32-6be2e2c8b7c7',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'b1cb7f3c-a22a-4fac-b64f-e397f4e84383',
        name: 'First-Notice-of-Loss (FNOL)',
        description: 'Ability to view Report of SI/Impact Events in a table view',
        exportReports: [
          {
            reportId: 'd0aaece1-3b8d-455c-a035-41c3a01a3faa',
            datasetId: '57308d84-0283-408f-b344-904a4953cc25',
            isPaginated: true,
          },
        ],
      },
      {
        id: '77e66b76-f038-48a9-beaf-f08852752780',
        name: 'Fleet Vehicle Device Count',
        description: 'Every fleet with no. of vehicles and number of devices',
        exportReports: [
          {
            reportId: '616ffbaa-6f04-4e24-abcb-e33a367d0b41',
            datasetId: '57308d84-0283-408f-b344-904a4953cc25',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  preproduction: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: '96eef547-94b3-461b-ad9b-00a12f6cf15f',
        name: 'Fleet Safety',
        description: 'Overview of safety scores for fleets based on driving behaviors.',
        exportReports: [
          {
            reportId: 'a767d982-4c77-4bb9-8d3b-f7efdead8e9f',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '2d241715-4472-4e46-9060-decadf552c57',
        name: 'Event Hotspots',
        description: 'Locations where incidents occur frequently for insured fleets.',
        exportReports: [
          {
            reportId: '39f5db5e-e0b8-4e74-ab7e-9eb03052e6c3',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'a1b2de1f-94c0-4d5a-a769-14978e9a4c43',
        name: 'Event Details',
        description: 'List of Events in each Fleet + event details.',
        exportReports: [
          {
            reportId: '7eb5c8cc-112c-4dcb-a31f-0c7c61b9c3d3',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '12471897-08d8-47bd-b6ec-312146a6d0dc',
        name: 'Fleet Miles',
        description: 'List of Fleets with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '44167c65-fb0f-4627-8f41-0df795dfee79',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '3fdce220-b4e7-4b0a-b196-d4c575e3f684',
        name: 'Vehicles without Devices',
        description: 'List of insured vehicles without active telematics devices.',
        exportReports: [
          {
            reportId: 'a5e8f50b-55d2-47c3-90f1-fa1a01197ded',
            datasetId: '2bdaa6e4-56f0-46e6-9949-a5b5ad62d6ca',
            isPaginated: true,
          },
        ],
      },
      {
        id: '5e573b04-884d-4d2d-a02f-3e31bd5951d7',
        name: 'Vehicle Risk',
        description: 'Vehicle-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: 'e2c02033-3e7e-465e-9762-d782d3338d64',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '223e8f45-3f52-4c24-8455-00cd316e10fd',
        name: 'Vehicle Details',
        description: 'List of insured vehicles in each Fleet + Vehicle details.',
        exportReports: [
          {
            reportId: '0dcf3dcd-5892-463d-aa11-bd4dddcf90c0',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
          {
            reportId: '3a8bdc6d-77e8-4fc9-89c6-c446b24c44c8',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'bd29759b-ca09-4e53-b1df-a84bef457109',
        name: 'Driver Risk',
        description: 'Driver-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: '84e5866a-6393-4e99-a68e-07f91cb8865e',
            datasetId: '91a2ed47-7d44-4dcb-9833-233405b2520e',
            isPaginated: true,
          },
        ],
      },
      {
        id: '8cbfde08-4e5e-412a-9b09-0d10ae079db6',
        name: 'Driver Details',
        description: 'List of drivers in each Fleet + driver details.',
        exportReports: [
          {
            reportId: '401598d6-8730-497c-9f68-a83a8b896e80',
            datasetId: '91a2ed47-7d44-4dcb-9833-233405b2520e',
            isPaginated: true,
          },
          {
            reportId: '97d28a0f-59cb-44b9-9997-ff3dd2b98f1c',
            datasetId: '91a2ed47-7d44-4dcb-9833-233405b2520e',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'a12fbab0-b2d9-4e39-b8ad-4d4e78796a31',
        name: 'High-Risk Trips',
        description: 'Trips involving unsafe behaviors or conditions(based on trip score)',
        exportReports: [
          {
            reportId: '67360dc7-d86f-4b30-98d0-2760fad08737',
            datasetId: '3f84b91e-5e60-4074-bfae-66dd77a09e8b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'bfe39ee1-6149-40f7-b39c-a617dc5b1997',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '31bc5644-0959-46e8-a35e-543d9d4ee02d',
            datasetId: '3f84b91e-5e60-4074-bfae-66dd77a09e8b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'f04514b5-603c-4974-bec5-5bfeacd41b7e',
        name: 'Vehicle Miles',
        description: 'List of Vehicles with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '7e2a4ac4-6a0a-4055-be92-42ffdaf9fcc7',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'f0a6e53e-720f-44bd-a057-78f4128f01bf',
        name: 'Driver Miles',
        description: 'List of Drivers with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: 'cdd9551c-a7a9-4607-b117-6164b19c07ad',
            datasetId: '03005848-3ef2-4407-a710-f610b06d3422',
            isPaginated: true,
          },
        ],
      },
      {
        id: '2665854e-4e71-4b00-bc43-87b0fb8e6d5d',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: '6711b8f7-5d62-4532-bfaf-8dc5181ccb6d',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '2513838b-e48c-4b05-bf64-e49b4368b9bb',
        name: 'First-Notice-of-Loss (FNOL)',
        description: 'Ability to view Report of SI/Impact Events in a table view',
        exportReports: [
          {
            reportId: 'b130e383-c202-4d3f-a919-0bf693308d8b',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '839db7c5-ae5c-426c-a4dd-4b7c467fc0a0',
        name: 'Fleet Vehicle Device Count',
        description: 'Every fleet with no. of vehicles and number of devices',
        exportReports: [
          {
            reportId: '0a3c66e6-9af2-4f18-b38a-6c20c0aa5f26',
            datasetId: '03005848-3ef2-4407-a710-f610b06d3422',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  prod: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: 'a274f663-3930-4057-a4bb-10917ea73cee',
        name: 'Fleet Safety',
        description: 'Overview of safety scores for fleets based on driving behaviors.',
        exportReports: [
          {
            reportId: 'e48b112d-b29c-4a62-9032-5df8bdda0de1',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '5a73c37a-3b2f-4286-b08e-473c6add47e9',
        name: 'Event Hotspots',
        description: 'Locations where incidents occur frequently for insured fleets.',
        exportReports: [
          {
            reportId: '1fe7ab3f-d22e-443e-8713-70f64bf32dab',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '539bf35e-8970-4f29-afed-a38f49c8427e',
        name: 'Event Details',
        description: 'List of Events in each Fleet + event details.',
        exportReports: [
          {
            reportId: '8dbb4245-c60c-43c3-93de-d83cc62a0bbe',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '9e126557-b67b-4a71-8769-f3bb0dfb2e0a',
        name: 'Fleet Miles',
        description: 'List of Fleets with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '0e48a3ab-f69b-4397-a652-dc2eef3bb69b',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '7a9e7204-5590-4acd-8a11-19259d9ee0e4',
        name: 'Vehicles without Devices',
        description: 'List of insured vehicles without active telematics devices.',
        exportReports: [
          {
            reportId: '4150bdaa-802f-4032-8a0e-49134dc452b8',
            datasetId: '8cd970b2-3dcd-4f1e-b9b8-67a27451b239',
            isPaginated: true,
          },
        ],
      },
      {
        id: '5c71361c-744d-41c3-9833-dd05ac695634',
        name: 'Vehicle Risk',
        description: 'Vehicle-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: '893c251e-a09e-4b2d-9661-4e35efe7d040',
            datasetId: '2d599a80-faf7-4c45-9674-bb0f6ae54a57',
            isPaginated: true,
          },
        ],
      },
      {
        id: '65d1052b-1220-4264-9325-f7b843588e47',
        name: 'Vehicle Details',
        description: 'List of insured vehicles in each Fleet + Vehicle details.',
        exportReports: [
          {
            reportId: 'aa85cabf-cf15-41d8-81f2-10c7196fe5a7',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
          {
            reportId: 'baae36ea-432d-4b85-bab9-a5137560a55c',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'e6282222-548c-42ed-918c-6b0e5777d841',
        name: 'Driver Risk',
        description: 'Driver-specific risk levels based on telematics and historical data.',
        exportReports: [
          {
            reportId: 'a24b031d-2d5d-41b4-9d4f-e1c0db70a698',
            datasetId: '24dd241f-3751-4392-a903-e5cb766d078b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '99413b8f-f364-494f-a9df-fd779c549549',
        name: 'Driver Details',
        description: 'List of drivers in each Fleet + driver details.',
        exportReports: [
          {
            reportId: '325ec377-42ac-4e25-b6aa-f1d3044f8061',
            datasetId: '24dd241f-3751-4392-a903-e5cb766d078b',
            isPaginated: true,
          },
          {
            reportId: 'a9a3d289-8d53-456f-a7de-b509ebc7b634',
            datasetId: '24dd241f-3751-4392-a903-e5cb766d078b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '0bce77df-fc9c-42d9-8bd9-5e0de9128471',
        name: 'High-Risk Trips',
        description: 'Trips involving unsafe behaviors or conditions(based on trip score)',
        exportReports: [
          {
            reportId: '92cd4a56-2895-4efe-bde7-31fea6a8ef61',
            datasetId: '18685070-c2b2-48cc-8545-561d26346f16',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'f2e5be1a-3206-4113-ae4d-73e301afadfa',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '7da852f7-b140-4a5a-b474-d79cbd489248',
            datasetId: '3f84b91e-5e60-4074-bfae-66dd77a09e8b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'ea46cee0-a188-47a0-bbcf-dcf48ce95c5b',
        name: 'Vehicle Miles',
        description: 'List of Vehicles with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '68633a46-3079-44bf-b644-811a700051b6',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: '86f691e1-ba86-4183-989e-e327461c4007',
        name: 'Driver Miles',
        description: 'List of Drivers with total miles driven(as calculated by Device GPS)',
        exportReports: [
          {
            reportId: '4abdcf92-835f-44f3-bb05-20ac54981f6c',
            datasetId: '24dd241f-3751-4392-a903-e5cb766d078b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'e6ecfcd6-018b-4be5-9f9d-da38cb33032a',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: 'e8bda8d2-bfdf-4238-a434-9a4a05fc5bd9',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'c85de227-6056-4ca4-ba4b-cb3bd2b8e827',
        name: 'First-Notice-of-Loss (FNOL)',
        description: 'Ability to view Report of SI/Impact Events in a table view',
        exportReports: [
          {
            reportId: 'ef4ad155-dcc5-4c87-8612-bc35620c78e7',
            datasetId: '1fb5e530-ccf1-4ee0-b9ce-0923085c763b',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'ad7475c5-8def-4bd6-824a-5a75cf15d406',
        name: 'Fleet Vehicle Device Count',
        description: 'Every fleet with no. of vehicles and number of devices',
        exportReports: [
          {
            reportId: 'c81ce413-4b42-49b7-958d-4d596e48f6c7',
            datasetId: '24dd241f-3751-4392-a903-e5cb766d078b',
            isPaginated: true,
          },
        ],
      },
    ],
  },
};
