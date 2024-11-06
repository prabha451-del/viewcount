import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';
import styles from './Viewcount.module.scss';
//import { Label } from '@fluentui/react/lib/Label';
import { ISpfxPnpPageprovisioningState } from './ISpfxPnpPageprovisioningState';
import { IViewcountProps } from './IViewcountProps';
import { Label } from 'office-ui-fabric-react';
//import {  TextField } from 'office-ui-fabric-react'

export default class Viewcount extends React.Component<IViewcountProps, ISpfxPnpPageprovisioningState> {
  constructor(props: IViewcountProps) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });
    this.state = {
      name: '',
      UserEmail: '',
      UserName: '',
      currentUser: null,
      viewers: []
    }
  }
  componentDidMount() {
    this.getCurrentUser();
    this.SaveData();
    this.loadViewersFromList();
    
  }

  getCurrentUser = async () => {
    try {
      const currentUser = await sp.web.currentUser();
      this.setState({
        UserEmail: currentUser.Email,
        UserName: currentUser.Title
      });
    } catch (error) {
      console.log('Error getting current user:', error);
    }
  };
  loadViewersFromList = async () => {
    try {
      //const items = await list.items.select("*", "UserName/Title").expand("UserName/ID").get();
      const list = sp.web.lists.getByTitle('ViewList');

      const items = await list.items.select('UserName/Title').expand('UserName/ID').get(); // Assuming 'Username' is the internal name of the column
      const viewers = items.map(item => item.UserName); // Assuming 'Username' is the internal name of the column
      this.setState({ viewers });
    } catch (error) {
      console.log('Error loading viewers from list:', error);
    }
  };
  SaveData = async () => {
    const { UserEmail, viewers } = this.state;

    // Check if the current user has already viewed the content
    const hasUserViewed = viewers.some(viewer => viewer.UserEmail === UserEmail);
    if (hasUserViewed) {
        console.log('User has already viewed the content. Updating viewers count.');
        // Increase viewers count
        this.setState(prevState => ({
            viewers: prevState.viewers.map(viewer => {
                if (viewer.UserEmail === UserEmail) {
                    return { ...viewer, count: viewer.count + 1 }; // Assuming there's a 'count' property for each viewer
                }
                return viewer;
            })
        }));
        return;
    }
    const currentUser = await sp.web.currentUser();
    // Check if the current user is not "ISRIADMIN" or "sumedh g"
    if (currentUser.Email !== "ISRIADMIN" && currentUser.Email !== "sumedh g") {
      const list = sp.web.lists.getByTitle('ViewList');
      await list.items.add({
        Title: this.state.name,
        UserNameId: currentUser.Id,
        UserEmailId: currentUser.Id
    });
        try {
            

            // Save data to SharePoint list
           
           // const list = sp.web.lists.getByTitle('ViewList');
//const items = await list.items
  //  .filter(`UserNameId eq '${UserName}'`)
   // .get();
           

            // Update state to reflect the new data
            this.setState(prevState => ({
                viewers: [...prevState.viewers, { UserName: currentUser.Id, UserEmail: currentUser.Id}]
            }));
if(currentUser.Email !== "ISRIADMIN" && currentUser.Email !== "sumedh g")
{
  console.log(' Skipping data saving.');
}
            console.log('Data saved successfully');
        } catch (error) {
            console.log('Error saving data:', error);
        }
    } else {
        console.log('User is either ISRIADMIN or sumedh g. Skipping data saving.');
    }
};

    
  onchange = (value: any, fieldName: any) => {
    //this.setState({ [fieldName]: value });
  };

  public render(): React.ReactElement<IViewcountProps> {
   // const { UserName } = this.state;
    const { viewers } = this.state;
    return (
      <div className={styles.welcome}>
       
      
       <Label>Viewers:</Label>
       <Label >{viewers.length}</Label>
       
      </div>
    );
  }
}
