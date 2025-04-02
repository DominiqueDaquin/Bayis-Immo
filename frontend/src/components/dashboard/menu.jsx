import HomeDashboard from "../home"
import Chat from "../chat"
import Annonce from "../annonce"
import Tombola from "../tombola/tombola"
import Notifications from "../notification"
import GestionnaireCampagnes from "../publicite"
import ProfileSettings from "../settings"
import UserManagementPage from "./utilisateurs"
export const COMPONENTS = {
  dashboard: <HomeDashboard />,
  annonces: <Annonce isModerateur={true} />,
  tombola: <Tombola isModerateur={true} />,
  publicite: <GestionnaireCampagnes isModerateur={false} />,
  notifications: <Notifications />,
  messages: <Chat />,
  statistiques: <Text>Statistiques</Text>,
  settings: <ProfileSettings />,
  utilisateurs:<UserManagementPage/>,
}