
export interface Block {
    id?: string;
    type: string;
    data: {
      text: string;
    };
  }
  
  export interface Topic {
    publishedId:string;
    title: string;
    date?: string;
    createdAt: number;
    topicNames?: string[];
    content?: {
      blocks: Block[];
    };
  }
  