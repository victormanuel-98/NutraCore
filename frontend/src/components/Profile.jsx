import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  User, 
  Mail, 
  Lock, 
  Target, 
  Activity,
  Award,
  Settings,
  Bell,
  Shield,
  Save,
  TrendingUp,
  Camera
} from "lucide-react";
import { CloudinaryUploadWidget } from "./ui/CloudinaryUploadWidget";

export function Profile() {
  const [profileData, setProfileData] = useState({
    name: "Usuario Demo",
    email: "usuario@nutracore.com",
    age: 28,
    weight: 75,
    height: 175,
    goal: "muscle-gain",
    activityLevel: "moderate",
    avatar: null,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    newsletter: false,
  });

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    // TODO: Implementar guardado real
    console.log("Saving profile:", profileData);
    alert("Perfil actualizado exitosamente!");
  };

  const calculateBMI = () => {
    const heightInMeters = profileData.height / 100;
    const bmi = profileData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const achievements = [
    { id: 1, name: "Primera semana completada", icon: "🎯", date: "10 Abril 2026" },
    { id: 2, name: "Racha de 7 días", icon: "🔥", date: "15 Abril 2026" },
    { id: 3, name: "10 recetas guardadas", icon: "📚", date: "12 Abril 2026" },
    { id: 4, name: "Meta calórica alcanzada", icon: "🏆", date: "14 Abril 2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">`r`n      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mi Perfil
            </h1>
            <p className="text-gray-600">
              Gestiona tu información personal y preferencias
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="p-6">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      {profileData.avatar ? (
                        <img 
                          src={profileData.avatar.replace('/upload/', '/upload/w_150,h_150,c_thumb,g_face,f_auto,q_auto/')} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <CloudinaryUploadWidget 
                      onUploadSuccess={(url) => handleProfileChange("avatar", url)}
                      multiple={false}
                      folder="nutracore/avatars"
                    >
                      <button className="absolute bottom-4 right-0 bg-white p-1.5 rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <Camera className="w-4 h-4 text-pink-accent" />
                      </button>
                    </CloudinaryUploadWidget>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {profileData.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    {profileData.email}
                  </p>
                  <Badge className="bg-pink-accent text-white">
                    Miembro desde Abril 2026
                  </Badge>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-accent" />
                  Estadísticas
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">IMC</span>
                    <span className="font-bold text-gray-900">{calculateBMI()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Racha actual</span>
                    <span className="font-bold text-gray-900">7 días</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Recetas guardadas</span>
                    <span className="font-bold text-gray-900">24</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Logros obtenidos</span>
                    <span className="font-bold text-gray-900">12</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Settings Tabs */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="personal">
                      <User className="w-4 h-4 mr-2" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="goals">
                      <Target className="w-4 h-4 mr-2" />
                      Objetivos
                    </TabsTrigger>
                    <TabsTrigger value="achievements">
                      <Award className="w-4 h-4 mr-2" />
                      Logros
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Ajustes
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Información Personal
                      </h3>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre completo</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="name"
                              type="text"
                              value={profileData.name}
                              onChange={(e) => handleProfileChange("name", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => handleProfileChange("email", e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">Edad</Label>
                          <Input
                            id="age"
                            type="number"
                            value={profileData.age}
                            onChange={(e) => handleProfileChange("age", parseInt(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="weight">Peso (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={profileData.weight}
                            onChange={(e) => handleProfileChange("weight", parseInt(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="height">Altura (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={profileData.height}
                            onChange={(e) => handleProfileChange("height", parseInt(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activityLevel">Nivel de actividad</Label>
                          <Select 
                            value={profileData.activityLevel}
                            onValueChange={(value) => handleProfileChange("activityLevel", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedentary">Sedentario</SelectItem>
                              <SelectItem value="light">Ligero</SelectItem>
                              <SelectItem value="moderate">Moderado</SelectItem>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="very-active">Muy activo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Cambiar Contraseña
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Contraseña actual</Label>
                            <Input id="currentPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nueva contraseña</Label>
                            <Input id="newPassword" type="password" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={saveProfile}
                      className="bg-pink-accent hover:bg-pink-accent/90 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </TabsContent>

                  {/* Goals Tab */}
                  <TabsContent value="goals" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Objetivos Nutricionales
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="goal">Objetivo principal</Label>
                          <Select 
                            value={profileData.goal}
                            onValueChange={(value) => handleProfileChange("goal", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight-loss">Perder peso</SelectItem>
                              <SelectItem value="muscle-gain">Ganar músculo</SelectItem>
                              <SelectItem value="maintain">Mantener peso</SelectItem>
                              <SelectItem value="health">Mejorar salud general</SelectItem>
                              <SelectItem value="performance">Rendimiento deportivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
                          <h4 className="font-bold text-gray-900 mb-4">
                            Objetivos Diarios Recomendados
                          </h4>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Calorías</p>
                              <p className="text-2xl font-bold text-gray-900">2,200 kcal</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Proteína</p>
                              <p className="text-2xl font-bold text-gray-900">150g</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Carbohidratos</p>
                              <p className="text-2xl font-bold text-gray-900">250g</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-1">Grasas</p>
                              <p className="text-2xl font-bold text-gray-900">73g</p>
                            </div>
                          </div>

                          <p className="text-sm text-gray-700 mt-4">
                            Basado en tu edad, peso, altura y nivel de actividad
                          </p>
                        </div>
                      </div>

                      <Button className="bg-pink-accent hover:bg-pink-accent/90 text-white mt-4">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Recalcular Objetivos
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Achievements Tab */}
                  <TabsContent value="achievements" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Tus Logros
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {achievements.map((achievement) => (
                          <Card key={achievement.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{achievement.icon}</div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {achievement.name}
                                </h4>
                                <p className="text-sm text-gray-500">{achievement.date}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          Sigue trabajando para desbloquear más logros
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notificaciones
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Notificaciones por email</p>
                            <p className="text-sm text-gray-600">Recibe recordatorios y actualizaciones</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={notifications.email}
                            onChange={(e) => handleNotificationChange("email", e.target.checked)}
                            className="w-5 h-5 text-pink-accent rounded"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Notificaciones push</p>
                            <p className="text-sm text-gray-600">Alertas en tiempo real</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={notifications.push}
                            onChange={(e) => handleNotificationChange("push", e.target.checked)}
                            className="w-5 h-5 text-pink-accent rounded"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Newsletter semanal</p>
                            <p className="text-sm text-gray-600">Recetas y artículos destacados</p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={notifications.newsletter}
                            onChange={(e) => handleNotificationChange("newsletter", e.target.checked)}
                            className="w-5 h-5 text-pink-accent rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Privacidad y Seguridad
                      </h3>

                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          Descargar mis datos
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          Gestionar permisos
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                          Eliminar cuenta
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







