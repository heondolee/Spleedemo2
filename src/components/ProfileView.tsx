import { useState } from 'react';
import { ArrowLeft, UserPlus, Settings, Lock, Unlock, ChevronRight, X } from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface FriendRequest {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  category: string;
}

interface DailyPlanPreview {
  date: string;
  tasks: { id: string; text: string; completed: boolean }[];
  goals: string[];
}

interface FriendFeedItem {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  dailyPlan: DailyPlanPreview;
  timestamp: string;
}

interface ProfileViewProps {
  onClose: () => void;
  isOpen: boolean;
}

export function ProfileView({ onClose, isOpen }: ProfileViewProps) {
  if (!isOpen) return null;

  const currentUser = {
    username: 'my_account',
    name: '나',
    bio: '열심히 공부하는 학생입니다 📚',
    avatar: 'U',
  };

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', username: 'study_mate', name: '김학생', avatar: 'SM', status: 'online' },
    { id: '2', username: 'exam_master', name: '이공부', avatar: 'EM', status: 'offline' },
    { id: '3', username: 'study_buddy', name: '박열정', avatar: 'SB', status: 'online' },
    { id: '4', username: 'goal_achiever', name: '최목표', avatar: 'GA', status: 'online' },
  ]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    { id: 'r1', username: 'new_friend', name: '정신규', avatar: 'NF' },
  ]);
  const [myTemplates, setMyTemplates] = useState<Template[]>([
    { id: 't1', name: '수능 D-100 플래너', description: '수능 대비 일일 계획', isPublic: true, category: 'daily' },
    { id: 't2', name: '내신 관리', description: '과목별 내신 관리', isPublic: true, category: 'exam' },
    { id: 't3', name: '개인 스터디', description: '나만의 학습법', isPublic: false, category: 'daily' },
  ]);
  const [profile, setProfile] = useState(currentUser);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const myDailyPlan: DailyPlanPreview = {
    date: '2026-01-24',
    tasks: [
      { id: '1', text: '수학 문제집 3단원', completed: true },
      { id: '2', text: '영어 단어 50개', completed: true },
      { id: '3', text: '과학 실험 보고서', completed: false },
    ],
    goals: ['공부 8시간', '운동 30분', '독서 1시간'],
  };

  const friendFeeds: FriendFeedItem[] = [
    {
      friendId: '1',
      friendName: '김학생',
      friendAvatar: 'SM',
      dailyPlan: {
        date: '2026-01-24',
        tasks: [
          { id: '1', text: '물리 기출 풀이', completed: true },
          { id: '2', text: '수학 모의고사', completed: false },
        ],
        goals: ['집중 공부 6시간'],
      },
      timestamp: '2시간 전',
    },
    {
      friendId: '3',
      friendName: '박열정',
      friendAvatar: 'SB',
      dailyPlan: {
        date: '2026-01-24',
        tasks: [
          { id: '1', text: '영어 듣기 연습', completed: true },
          { id: '2', text: '한국사 암기', completed: true },
          { id: '3', text: '화학 실험 정리', completed: true },
        ],
        goals: ['완벽한 하루', '모든 과목 복습'],
      },
      timestamp: '1시간 전',
    },
    {
      friendId: '4',
      friendName: '최목표',
      friendAvatar: 'GA',
      dailyPlan: {
        date: '2026-01-24',
        tasks: [
          { id: '1', text: '생물 정리노트', completed: false },
          { id: '2', text: '수학 심화 문제', completed: false },
        ],
        goals: ['오늘도 화이팅!'],
      },
      timestamp: '30분 전',
    },
  ];

  const handleAddFriend = () => {
    if (searchUsername.trim()) {
      // 실제로는 API 호출
      alert(`친구 요청을 보냈습니다: ${searchUsername}`);
      setSearchUsername('');
      setShowAddFriend(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriends([...friends, { ...request, status: 'offline' }]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const handleRejectRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const toggleTemplateVisibility = (templateId: string) => {
    setMyTemplates(myTemplates.map(t => 
      t.id === templateId ? { ...t, isPublic: !t.isPublic } : t
    ));
  };

  return (
    <div className="fixed inset-0 bg-background z-50 w-full h-full flex">
      {/* Left Side - Friends & Feed */}
      <div className="flex-1 flex flex-col border-r border-border">
        {/* Header */}
        <div className="h-[56px] border-b border-border px-[16px] flex items-center gap-[12px]">
          <button
            onClick={onClose}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
          </button>
          <span className="font-semibold" style={{ fontSize: '16px' }}>프로필</span>
          <div className="flex-1" />
          <button
            onClick={() => setShowAddFriend(true)}
            className="px-[12px] py-[6px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors font-medium flex items-center gap-[6px]"
            style={{ fontSize: '13px' }}
          >
            <UserPlus className="w-[16px] h-[16px]" />
            친구 추가
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="p-[16px] border-b border-border">
              <h3 className="font-semibold mb-[12px]" style={{ fontSize: '14px' }}>친구 요청</h3>
              <div className="space-y-[8px]">
                {friendRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-[12px] p-[12px] bg-accent/20 rounded-[8px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      {request.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" style={{ fontSize: '14px' }}>{request.name}</div>
                      <div className="text-muted-foreground" style={{ fontSize: '12px' }}>@{request.username}</div>
                    </div>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-[10px] py-[5px] bg-primary text-primary-foreground rounded-[6px] hover:bg-primary/90 transition-colors text-xs font-medium"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-[10px] py-[5px] border border-border rounded-[6px] hover:bg-accent transition-colors text-xs font-medium"
                    >
                      거절
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="p-[16px] border-b border-border">
            <div className="flex items-center justify-between mb-[12px]">
              <h3 className="font-semibold" style={{ fontSize: '14px' }}>친구 {friends.length}명</h3>
              <button
                onClick={() => setShowAllFriends(!showAllFriends)}
                className="text-primary hover:underline flex items-center gap-[4px]"
                style={{ fontSize: '13px' }}
              >
                {showAllFriends ? '접기' : '모두 보기'}
                <ChevronRight className={`w-[14px] h-[14px] transition-transform ${showAllFriends ? 'rotate-90' : ''}`} />
              </button>
            </div>
            <div className={`grid ${showAllFriends ? 'grid-cols-1' : 'grid-cols-2'} gap-[8px]`}>
              {(showAllFriends ? friends : friends.slice(0, 4)).map((friend) => (
                <div key={friend.id} className="flex items-center gap-[10px] p-[10px] rounded-[8px] hover:bg-accent transition-colors">
                  <div className="relative">
                    <div className="w-[36px] h-[36px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {friend.avatar}
                    </div>
                    {friend.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-[10px] h-[10px] bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ fontSize: '13px' }}>{friend.name}</div>
                    <div className="text-muted-foreground truncate" style={{ fontSize: '11px' }}>@{friend.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friend Feeds */}
          <div className="p-[16px]">
            <h3 className="font-semibold mb-[12px]" style={{ fontSize: '14px' }}>친구 피드</h3>
            <div className="flex gap-[12px] overflow-x-auto pb-[8px]" style={{ scrollbarWidth: 'thin' }}>
              {friendFeeds.map((feed) => (
                <div key={feed.friendId} className="flex-shrink-0 w-[280px] border border-border rounded-[12px] p-[14px] bg-background hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-[10px] mb-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {feed.friendAvatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium" style={{ fontSize: '13px' }}>{feed.friendName}</div>
                      <div className="text-muted-foreground" style={{ fontSize: '11px' }}>{feed.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-[8px]">오늘의 계획</div>
                  <div className="space-y-[6px] mb-[10px]">
                    {feed.dailyPlan.tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-[8px] text-sm">
                        <div className={`w-[14px] h-[14px] border-2 rounded-[3px] flex-shrink-0 ${
                          task.completed ? 'bg-primary border-primary' : 'border-border'
                        }`} />
                        <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {feed.dailyPlan.goals.length > 0 && (
                    <div className="pt-[10px] border-t border-border">
                      <div className="text-xs text-muted-foreground mb-[6px]">목표</div>
                      {feed.dailyPlan.goals.map((goal, idx) => (
                        <div key={idx} className="text-sm text-primary">• {goal}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - My Profile & Templates */}
      <div className="w-[450px] flex flex-col bg-accent/5">
        {/* My Profile */}
        <div className="p-[20px] border-b border-border">
          <div className="flex items-start gap-[16px]">
            <div className="w-[64px] h-[64px] rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl">
              {profile.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-[8px] mb-[4px]">
                <h2 className="font-bold" style={{ fontSize: '18px' }}>{profile.name}</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
                >
                  <Settings className="w-[14px] h-[14px]" />
                </button>
              </div>
              <div className="text-muted-foreground mb-[8px]" style={{ fontSize: '13px' }}>@{profile.username}</div>
              <p className="text-sm">{profile.bio}</p>
            </div>
          </div>
        </div>

        {/* My Templates */}
        <div className="flex-1 overflow-auto p-[20px] border-b border-border">
          <h3 className="font-semibold mb-[12px]" style={{ fontSize: '15px' }}>내 템플릿</h3>
          <div className="space-y-[10px]">
            {myTemplates.map((template) => (
              <div key={template.id} className="border border-border rounded-[10px] p-[12px] bg-background">
                <div className="flex items-start justify-between mb-[6px]">
                  <div className="flex-1">
                    <div className="font-medium mb-[2px]" style={{ fontSize: '14px' }}>{template.name}</div>
                    <div className="text-muted-foreground text-xs">{template.description}</div>
                  </div>
                  <button
                    onClick={() => toggleTemplateVisibility(template.id)}
                    className={`ml-[8px] w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${
                      template.isPublic ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-accent hover:bg-accent/70'
                    }`}
                  >
                    {template.isPublic ? <Unlock className="w-[16px] h-[16px]" /> : <Lock className="w-[16px] h-[16px]" />}
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {template.isPublic ? '공개' : '비공개'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Daily Plan Preview */}
        <div className="p-[20px]">
          <h3 className="font-semibold mb-[12px]" style={{ fontSize: '15px' }}>오늘의 계획</h3>
          <div className="border border-border rounded-[10px] p-[14px] bg-background/50">
            <div className="text-muted-foreground mb-[10px]" style={{ fontSize: '12px' }}>
              {myDailyPlan.date}
            </div>
            <div className="space-y-[6px] mb-[12px]">
              {myDailyPlan.tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-[8px] text-sm">
                  <div className={`w-[14px] h-[14px] border-2 rounded-[3px] flex-shrink-0 ${
                    task.completed ? 'bg-primary border-primary' : 'border-border'
                  }`} />
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.text}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-[12px] border-t border-border">
              <div className="text-xs text-muted-foreground mb-[6px]">목표</div>
              {myDailyPlan.goals.map((goal, idx) => (
                <div key={idx} className="text-sm text-primary">• {goal}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddFriend(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 bg-background border border-border rounded-[16px] p-[24px] w-[400px]">
            <div className="flex items-center justify-between mb-[20px]">
              <h3 className="font-semibold" style={{ fontSize: '16px' }}>친구 추가</h3>
              <button
                onClick={() => setShowAddFriend(false)}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-accent transition-colors"
              >
                <X className="w-[16px] h-[16px]" />
              </button>
            </div>
            
            <div className="mb-[16px]">
              <label className="text-sm text-muted-foreground mb-[8px] block">사용자 아이디</label>
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-[12px] py-[10px] rounded-[8px] border border-border bg-background outline-none focus:border-primary transition-colors"
                style={{ fontSize: '14px' }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
              />
            </div>
            
            <button
              onClick={handleAddFriend}
              className="w-full px-[16px] py-[10px] bg-primary text-primary-foreground rounded-[8px] hover:bg-primary/90 transition-colors font-medium"
              style={{ fontSize: '14px' }}
            >
              친구 요청 보내기
            </button>
          </div>
        </>
      )}
    </div>
  );
}